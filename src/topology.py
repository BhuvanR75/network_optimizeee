import os
import json
import numpy as np
import pandas as pd

# =====================================================
# CONFIGURATION
# =====================================================
DATA_DIR = "data"

# Timing
SYMBOL_DURATION = 0.0005 / 14      # seconds
SYMBOLS_PER_SLOT = 14

# Cleaning
SPIKE_THRESHOLD_KBIT = 5000
PERCENTILE = 95

# Link capacities
LEAF_LINK_GBPS = 25
AGG_LINK_GBPS = 100

LEAF_CAPACITY_KBIT = int(LEAF_LINK_GBPS * 1_000_000 * 0.0005)
AGG_CAPACITY_KBIT = int(AGG_LINK_GBPS * 1_000_000 * 0.0005)

# =====================================================
# LOAD THROUGHPUT (SYMBOL → SLOT)
# =====================================================
def load_throughput(path):
    df = pd.read_csv(
        path,
        sep=r"\s+",
        header=None,
        names=["timestamp", "kbit"],
        engine="python"
    )

    df["timestamp"] = pd.to_numeric(df["timestamp"], errors="coerce")
    df["kbit"] = pd.to_numeric(df["kbit"], errors="coerce")
    df = df.dropna().sort_values("timestamp")

    df.loc[df["kbit"] > SPIKE_THRESHOLD_KBIT, "kbit"] = 0

    df["slot"] = ((df["timestamp"] - df["timestamp"].min()) /
                  (SYMBOL_DURATION * SYMBOLS_PER_SLOT)).astype(int)

    return df.groupby("slot")["kbit"].sum().values

# =====================================================
# LOAD PACKET STATS (VALIDATION ONLY)
# =====================================================
def load_packet_stats(path):
    df = pd.read_csv(
        path,
        sep=r"\s+",
        header=None,
        names=["timestamp", "tx", "rx", "too_late"],
        engine="python"
    )

    for c in ["timestamp", "tx", "rx", "too_late"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    df = df.dropna()

    loss_events = ((df["tx"] - df["rx"]) > 0).sum()
    stress_events = (df["too_late"] > 0).sum()

    return {
        "loss": int(loss_events),
        "stress": int(stress_events)
    }

# =====================================================
# FIRST-FIT DECREASING (MINIMUM LEAF LINKS)
# =====================================================
def build_leaf_links(cell_demand):
    sorted_cells = sorted(
        cell_demand.items(),
        key=lambda x: x[1],
        reverse=True
    )

    links = []
    loads = []

    for cid, demand in sorted_cells:
        placed = False
        for i in range(len(links)):
            if loads[i] + demand <= LEAF_CAPACITY_KBIT:
                links[i].append(cid)
                loads[i] += demand
                placed = True
                break

        if not placed:
            links.append([cid])
            loads.append(demand)

    leaf_links = []
    for i, (cells, load) in enumerate(zip(links, loads), 1):
        leaf_links.append({
            "name": f"Leaf-Link-{i}",
            "cells": cells,
            "load": load
        })

    return leaf_links

# =====================================================
# BUILD AGGREGATION LINKS
# =====================================================
def build_aggregation_links(leaf_links):
    agg_links = []
    agg_loads = []

    for leaf in leaf_links:
        placed = False
        for i in range(len(agg_links)):
            if agg_loads[i] + leaf["load"] <= AGG_CAPACITY_KBIT:
                agg_links[i]["children"].append(leaf)
                agg_loads[i] += leaf["load"]
                placed = True
                break

        if not placed:
            agg_links.append({
                "name": f"Agg-Link-{len(agg_links)+1}",
                "children": [leaf]
            })
            agg_loads.append(leaf["load"])

    return agg_links

# =====================================================
# BUILD TREE STRUCTURE
# =====================================================
def build_tree(agg_links):
    tree = {"DU": {}}

    for agg in agg_links:
        tree["DU"][agg["name"]] = {}
        for leaf in agg["children"]:
            tree["DU"][agg["name"]][leaf["name"]] = {
                "cells": [f"Cell-{c}" for c in leaf["cells"]]
            }

    return tree

# =====================================================
# PRETTY PRINT TREE
# =====================================================
def print_tree(tree):
    print("\n=== HIERARCHICAL FRONTHAUL TOPOLOGY ===")
    print("DU")
    for agg, leafs in tree["DU"].items():
        print(f" ├── {agg}")
        for leaf, data in leafs.items():
            print(f" │    ├── {leaf}")
            for cell in data["cells"]:
                print(f" │    │    ├── {cell}")

# =====================================================
# MAIN
# =====================================================
def main():
    print(f"Leaf link capacity: {LEAF_LINK_GBPS} Gbps")
    print(f"Aggregation link capacity: {AGG_LINK_GBPS} Gbps")

    cell_ids = sorted({
        f.split("-")[-1].split(".")[0]
        for f in os.listdir(DATA_DIR)
        if f.startswith("throughput-cell")
    })

    print(f"\nDetected {len(cell_ids)} cells")

    cell_demand = {}
    pkt_info = {}

    # ---------------------------------
    # Load data
    # ---------------------------------
    for cid in cell_ids:
        tp = load_throughput(f"{DATA_DIR}/throughput-cell-{cid}.dat")
        pkt = load_packet_stats(f"{DATA_DIR}/pkt-stats-cell-{cid}.dat")

        cell_demand[cid] = np.percentile(tp, PERCENTILE)
        pkt_info[cid] = pkt

        print(
            f"Cell {cid}: "
            f"P95={cell_demand[cid]:.1f} kbit/slot, "
            f"loss={pkt['loss']}, stress={pkt['stress']}"
        )

    # ---------------------------------
    # Leaf links (optimization)
    # ---------------------------------
    leaf_links = build_leaf_links(cell_demand)

    print("\n=== LEAF FRONTHAUL LINKS ===")
    for l in leaf_links:
        util = 100 * l["load"] / LEAF_CAPACITY_KBIT
        print(f"{l['name']}: cells={l['cells']}, utilization={util:.1f}%")

    # ---------------------------------
    # Aggregation links
    # ---------------------------------
    agg_links = build_aggregation_links(leaf_links)

    # ---------------------------------
    # Build tree
    # ---------------------------------
    tree = build_tree(agg_links)
    print_tree(tree)

    # ---------------------------------
    # Export JSON
    # ---------------------------------
    with open("fronthaul_tree.json", "w") as f:
        json.dump(tree, f, indent=2)

    print("\nTopology exported to fronthaul_tree.json")

# =====================================================
if __name__ == "__main__":
    main()
