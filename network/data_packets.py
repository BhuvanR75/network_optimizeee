import time
import requests
import numpy as np
from mininet.net import Mininet
from mininet.node import Node
from mininet.link import TCLink
from mininet.log import setLogLevel, info

# Import your agent
from q_learning_agent import QLearningAgent

# ================= CONFIG =================
BACKEND_URL = "http://localhost:5000/api/metrics"
RUNNING = True

# Goal: 1% Packet Loss
TARGET_LOSS = 0.01 

# Bandwidth Search Range (Mbps)
MIN_BW = 4.0
MAX_BW = 12.0
STEP_SIZE = 0.2

# Action Map for readable logs
ACTION_MAP = {0: "DECREASE ▼", 1: "HOLD ▬", 2: "INCREASE ▲"}

# ================= ROUTER =================
class LinuxRouter(Node):
    def config(self, **params):
        super().config(**params)
        self.cmd("sysctl -w net.ipv4.ip_forward=1")

    def terminate(self):
        self.cmd("sysctl -w net.ipv4.ip_forward=0")
        super().terminate()

# ================= STATS HELPERS =================
def read_stat(node, iface, stat):
    try:
        path = f"/sys/class/net/{iface}/statistics/{stat}"
        return int(node.cmd(f"cat {path}"))
    except:
        return 0

def update_link_bandwidth(net, new_bw):
    """
    STRICT Enforcement using Linux Traffic Control (tc).
    This forces the kernel to drop packets immediately if limits are exceeded.
    """
    r1 = net.get('r1')
    r2 = net.get('r2')
    if1, if2 = "r1-eth0", "r2-eth0"
    
    # Physics: Small burst/limit ensures instant drops on overflow
    burst = 10 * 1024  # 10KB
    limit = 5 * 1024   # 5KB Buffer
    
    # Apply Limit
    cmd = "tc qdisc replace dev {} root tbf rate {}mbit burst {} limit {}"
    r1.cmd(cmd.format(if1, new_bw, burst, limit))
    r2.cmd(cmd.format(if2, new_bw, burst, limit))
    
    # Force Offloading OFF
    off_cmd = "ethtool -K {} gro off gso off tso off"
    r1.cmd(off_cmd.format(if1))
    r2.cmd(off_cmd.format(if2))

# ================= AI MONITOR =================
def monitor_train_and_send(net):
    global RUNNING
    
    r1, r2 = net.get("r1"), net.get("r2")
    agent = QLearningAgent(action_space_size=3)
    
    # Start at 10Mbps (Safe Zone)
    current_bw = 10.0
    update_link_bandwidth(net, current_bw)
    
    # Initial Snapshot
    stats = {
        "rx_bytes": read_stat(r2, "r2-eth0", "rx_bytes"),
        "rx_pkts":  read_stat(r2, "r2-eth0", "rx_packets"),
        "tx_pkts":  read_stat(r1, "r1-eth0", "tx_packets"),
        "rx_errs":  read_stat(r2, "r2-eth0", "rx_errors"),
        "time":     time.time()
    }
    
    print(f"\n🚀 AI Agent Started: r1 → r2")
    print(f"🌊 Traffic: 8.0 Mbps | 🎯 Target Loss: {TARGET_LOSS*100}%")
    print("-" * 100)
    print(f"{'Limit':<10} | {'Actual':<10} | {'Drops':<8} | {'Loss %':<8} | {'Reward':<8} | {'Action'}")
    print("-" * 100)

    while RUNNING:
        time.sleep(1.0)
        
        # 1. READ NEW METRICS
        new_stats = {
            "rx_bytes": read_stat(r2, "r2-eth0", "rx_bytes"),
            "rx_pkts":  read_stat(r2, "r2-eth0", "rx_packets"),
            "tx_pkts":  read_stat(r1, "r1-eth0", "tx_packets"),
            "rx_errs":  read_stat(r2, "r2-eth0", "rx_errors"),
            "time":     time.time()
        }

        # Diffs
        dt = new_stats["time"] - stats["time"]
        if dt <= 0: continue

        rx_bits = (new_stats["rx_bytes"] - stats["rx_bytes"]) * 8
        rx_pkts_diff = new_stats["rx_pkts"] - stats["rx_pkts"]
        tx_pkts_diff = new_stats["tx_pkts"] - stats["tx_pkts"]
        rx_errs_diff = new_stats["rx_errs"] - stats["rx_errs"]

        # 2. CALCULATE DERIVED STATS
        throughput_mbps = rx_bits / (dt * 1e6)
        dropped_pkts = max(0, tx_pkts_diff - rx_pkts_diff)
        loss_rate = (dropped_pkts / tx_pkts_diff) if tx_pkts_diff > 0 else 0.0

        # 3. REWARD (Penalize 0% loss to force optimization)
        loss_err = abs(loss_rate - TARGET_LOSS)
        
        if loss_rate == 0.0: reward = -2.0  # Push to find limit
        elif loss_err < 0.005: reward = 100.0 # Jackpot
        elif loss_err < 0.02: reward = 10.0   # Close
        else: reward = -100.0 * loss_err      # Far off

        # 4. AGENT ACTION
        action = agent.act(current_bw)
        
        next_bw = current_bw
        if action == 0:   next_bw -= STEP_SIZE
        elif action == 2: next_bw += STEP_SIZE
        next_bw = round(max(MIN_BW, min(MAX_BW, next_bw)), 1)
        
        # 5. EXECUTE & LEARN
        agent.learn(current_bw, action, reward, next_bw)
        if next_bw != current_bw:
            update_link_bandwidth(net, next_bw)
            current_bw = next_bw

        # 6. SEND COMPLETE DATA TO SERVER
        payload = {
            "timestamp": new_stats["time"],
            "source": "r1",
            "destination": "r2",
            
            # Network Metrics
            "bandwidth_mbps": round(throughput_mbps, 3),
            "packets_sent": tx_pkts_diff,
            "packets_received": rx_pkts_diff,
            "packets_dropped": dropped_pkts,
            "rx_errors": rx_errs_diff,
            "loss_rate": round(loss_rate, 5),
            
            # AI Metrics
            "current_capacity_limit": current_bw,
            "agent_action": ACTION_MAP[action],
            "agent_reward": round(reward, 2),
            "agent_epsilon": round(agent.epsilon, 4)
        }

        try:
            requests.post(BACKEND_URL, json=payload, timeout=0.1)
            # Local Print
            warn = "⚠️" if throughput_mbps > (current_bw + 1.0) else ""
            print(f"{current_bw:<10} | {throughput_mbps:<10.2f} | {dropped_pkts:<8} | {loss_rate*100:<8.2f} | {reward:<8.1f} | {ACTION_MAP[action]} {warn}")
        except:
            pass

        stats = new_stats

# ================= MAIN =================
def run():
    global RUNNING
    net = Mininet(link=TCLink, build=False)
    
    r1 = net.addHost("r1", cls=LinuxRouter)
    r2 = net.addHost("r2", cls=LinuxRouter)
    net.addLink(r1, r2, bw=10) # Init link

    net.start()
    r1.cmd("ifconfig r1-eth0 10.0.0.1/24")
    r2.cmd("ifconfig r2-eth0 10.0.0.2/24")
    
    # Disable offload immediately
    for h in [r1, r2]:
        h.cmd("ethtool -K {}-eth0 gro off gso off tso off".format(h.name))

    print("*** Sending 8Mbps UDP Traffic...")
    r2.cmd("iperf -s -u &")
    time.sleep(1)
    r1.cmd("iperf -c 10.0.0.2 -u -b 8M -t 1000 &")

    try:
        monitor_train_and_send(net)
    except KeyboardInterrupt:
        pass
    finally:
        RUNNING = False
        net.stop()

if __name__ == "__main__":
    setLogLevel("info")
    run()