import numpy as np
import random
import pickle

# ================= HYPERPARAMETERS =================
LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.95
EPSILON = 1.0          # Exploration rate (start high)
EPSILON_MIN = 0.01     # Minimum exploration
EPSILON_DECAY = 0.995  # Decay per step

class QLearningAgent:
    def __init__(self, action_space_size=3):
        """
        Q-Table structure:
        Key: State (Current Bandwidth as a string, e.g., "5.5")
        Value: Array of 3 Q-values [Decrease, Maintain, Increase]
        """
        self.q_table = {}
        self.action_space_size = action_space_size
        self.epsilon = EPSILON

    def get_state_key(self, bandwidth):
        """
        Convert continuous bandwidth to a discrete string key.
        We round to 1 decimal place to group similar states.
        """
        return str(round(bandwidth, 1))

    def get_q_values(self, state):
        if state not in self.q_table:
            # Initialize new state with zeros
            self.q_table[state] = np.zeros(self.action_space_size)
        return self.q_table[state]

    def act(self, bandwidth):
        state = self.get_state_key(bandwidth)
        
        # Epsilon-greedy strategy: Explore vs Exploit
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_space_size)
        
        q_values = self.get_q_values(state)
        return np.argmax(q_values)

    def learn(self, current_bw, action, reward, next_bw):
        state = self.get_state_key(current_bw)
        next_state = self.get_state_key(next_bw)

        q_current = self.get_q_values(state)
        q_next = self.get_q_values(next_state)

        # Bellman Equation
        # NewQ = OldQ + Alpha * [Reward + Gamma * Max(NextQ) - OldQ]
        best_next_action_value = np.max(q_next)
        
        q_current[action] = q_current[action] + LEARNING_RATE * (
            reward + DISCOUNT_FACTOR * best_next_action_value - q_current[action]
        )

        # Decay epsilon to reduce randomness over time
        if self.epsilon > EPSILON_MIN:
            self.epsilon *= EPSILON_DECAY

    def save_table(self, filename="q_table.pkl"):
        try:
            with open(filename, "wb") as f:
                pickle.dump(self.q_table, f)
        except:
            pass