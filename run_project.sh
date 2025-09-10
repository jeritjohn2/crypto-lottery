#!/bin/bash
set -e

# Paths
MAIN_DIR="$(pwd)"  # Assuming script is in main project dir
CONTRACTS_DIR="$MAIN_DIR/contract"

echo "Step 1: Starting Hardhat node..."
cd "$CONTRACTS_DIR"
npx hardhat node &
NODE_PID=$!
sleep 5  # Give Hardhat time to start

echo "Step 2: Deploying mock USDT..."
USDT_DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy-mockusdt.js --network localhost)
USDT_ADDRESS=$(echo "$USDT_DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}')

if [ -z "$USDT_ADDRESS" ]; then
  echo "❌ Failed to get USDT address"
  kill $NODE_PID
  exit 1
fi

echo "✅ USDT deployed at $USDT_ADDRESS"
sed -i "s/^export const USDT_ADDRESS = .*/export const USDT_ADDRESS = \"$USDT_ADDRESS\";/" "$MAIN_DIR/src/constants.js"
sed -i "s/^[[:space:]]*const usdtAddress = .*/const usdtAddress = \"$USDT_ADDRESS\";/" "$CONTRACTS_DIR/scripts/deploy.js"
echo "✅ USDT copied at $USDT_ADDRESS"

echo "Step 3: Deploying Lottery..."
LOTTERY_DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network localhost)
LOTTERY_ADDRESS=$(echo "$LOTTERY_DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}')

if [ -z "$LOTTERY_ADDRESS" ]; then
  echo "❌ Failed to get Lottery address"
  kill $NODE_PID
  exit 1
fi

echo "✅ Lottery deployed at $LOTTERY_ADDRESS"
sed -i "s/^export const LOTTERY_ADDRESS = .*/export const LOTTERY_ADDRESS = \"$LOTTERY_ADDRESS\";/" "$MAIN_DIR/src/constants.js"

echo "Step 4: Starting frontend..."
cd "$MAIN_DIR"
npm start &
FRONTEND_PID=$!

# Keep both running
wait $NODE_PID $FRONTEND_PID

# netstat -ano | grep 8545
