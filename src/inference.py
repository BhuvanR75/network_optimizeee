# inference.py
import os
import numpy as np
import pandas as pd

# ================= CONFIG =================
SYMBOL_DURATION = 0.0005 / 14
SYMBOLS_PER_SLOT = 14
SPIKE_THRESHOLD_KBIT = 5000
PERCENTILE = 95

LEAF_LINK_GBPS = 25
AGG_LINK_GBPS = 100

LEAF_CAPACITY_KBIT = int(LEAF_LINK_GBPS * 1_000_000 * 0.0005)
AGG_CAPACITY_KBIT = int(AGG_LINK_GBPS * 1_000_000 * 0.0005)

# ================= LOADERS =================
def load_throughput(path):
    df = pd.read_csv(
        path, sep=r"\s+", header=None,
        names=["timestamp", "kbit"], engine="python"
    )
    df["timestamp"] = pd.to_numeric(df["timestamp"], errors="coerce")
    df["kbit"] = pd.to_numeric(df["kbit"], errors="coerce")
    df = df.dropna().sort_values("timestamp")
    df.loc[df["kbit"] > SPIKE_THRESHOLD_KBIT, "kbit"] = 0

    df["slot"] = ((df["timestamp"] - df["timestamp"].min()) /
                  (SYMBOL_DURATION * SYMBOLS_PER_SLOT)).astype(int)

    return df.groupby("slot")["kbit"].sum().values


def load_packet_stats(path):
    df = pd.read_csv(
        path, sep=r"\s+", header=None,
        names=["timestamp", "tx", "rx", "too_late"], engine="python"
    )
    for c in ["timestamp", "tx", "rx", "too_late"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna()

    return {
        "loss": int(((df["tx"] - df["rx"]) > 0).sum()),
        "stress": int((df["too_late"] > 0).sum())
    }

# ================= CORE LOGIC =================
def build_leaf_links(cell_demand):
    sorted_cells = sorted(cell_demand.items(), key=lambda x: x[1], reverse=True)
    links, loads = [], []

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

    return [
        {"name": f"Leaf-Link-{i+1}", "cells": cells, "load": loads[i]}
        for i, cells in enumerate(links)
    ]


def build_aggregation_links(leaf_links):
    agg_links, agg_loads = [], []

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


def build_tree(agg_links):
    tree = {"DU": {}}
    for agg in agg_links:
        tree["DU"][agg["name"]] = {}
        for leaf in agg["children"]:
            tree["DU"][agg["name"]][leaf["name"]] = {
                "cells": [f"Cell-{c}" for c in leaf["cells"]]
            }
    return tree


def infer_topology(data_dir):
    cell_ids = sorted({
        f.split("-")[-1].split(".")[0]
        for f in os.listdir(data_dir)
        if f.startswith("throughput-cell")
    })

    cell_demand = {}
    pkt_stats = {}

    for cid in cell_ids:
        tp = load_throughput(f"{data_dir}/throughput-cell-{cid}.dat")
        cell_demand[cid] = np.percentile(tp, PERCENTILE)
        pkt_stats[cid] = load_packet_stats(f"{data_dir}/pkt-stats-cell-{cid}.dat")

    leaf_links = build_leaf_links(cell_demand)
    agg_links = build_aggregation_links(leaf_links)
    tree = build_tree(agg_links)

    return {
        "assumptions": {
            "leaf_link_gbps": LEAF_LINK_GBPS,
            "aggregation_link_gbps": AGG_LINK_GBPS
        },
        "summary": {
            "cells": len(cell_ids),
            "leaf_links": len(leaf_links),
            "aggregation_links": len(agg_links)
        },
        "tree": tree,
        "leaf_links": leaf_links,
        "aggregation_links": [
            {
                "name": a["name"],
                "children": [l["name"] for l in a["children"]]
            } for a in agg_links
        ]
    }
