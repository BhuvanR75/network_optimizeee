import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque

# ================= HYPERPARAMETERS =================
GAMMA = 0.95            # Discount factor
Qr_LR = 0.001           # Learning rate
xr_EPSILON = 1.0        # Exploration rate (start)
xr_EPSILON_MIN = 0.01   # Minimum exploration
xr_DECAY = 0.995        # Decay per step
BATCH_SIZE = 32
MEMORY_SIZE = 1000

# ================= NEURAL NETWORK =================
class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_dim, 24)
        self.fc2 = nn.Linear(24, 24)
        self.out = nn.Linear(24, action_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.out(x)

# ================= AGENT CLASS =================
class DQLAgent:
    def __init__(self, state_dim=3, action_dim=3):
        """
        State: [Current_BW_Limit, Actual_Throughput, Packet_Loss_Rate]
        Actions: 0=Decrease BW, 1=Maintain, 2=Increase BW
        """
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.memory = deque(maxlen=MEMORY_SIZE)
        self.epsilon = xr_EPSILON
        
        self.model = DQN(state_dim, action_dim)
        self.optimizer = optim.Adam(self.model.parameters(), lr=Qr_LR)
        self.criterion = nn.MSELoss()

    def act(self, state):
        # Epsilon-greedy action selection
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_dim)
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        with torch.no_grad():
            q_values = self.model(state_tensor)
        return torch.argmax(q_values).item()

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def replay(self):
        ifVr = len(self.memory)
        if ifVr < BATCH_SIZE:
            return

        minibatch = random.sample(self.memory, BATCH_SIZE)

        for state, action, reward, next_state, done in minibatch:
            target = reward
            if not done:
                next_state_tensor = torch.FloatTensor(next_state).unsqueeze(0)
                target = reward + GAMMA * torch.max(self.model(next_state_tensor)).item()
            
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            current_q = self.model(state_tensor)
            
            # Clone to avoid in-place mutation errors
            target_f = current_q.clone()
            target_f[0][action] = target
            
            self.optimizer.zero_grad()
            loss = self.criterion(current_q, target_f)
            loss.backward()
            self.optimizer.step()

        if self.epsilon > xr_EPSILON_MIN:
            self.epsilon *= xr_DECAY