#!/bin/bash

# Configuration - UPDATE THESE VALUES
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_AWS_ACCOUNT_ID"
ECR_REPO_NAME="attendance-app"
ECS_CLUSTER_NAME="attendance-cluster"
ECS_SERVICE_NAME="attendance-service"
ECS_TASK_FAMILY="attendance-task"

# Full ECR repository URL
ECR_REPO_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "======================================"
echo "Deploying Attendance App to AWS ECS"
echo "======================================"

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t ${ECR_REPO_NAME}:latest .

# Step 2: Tag the image for ECR
echo "Tagging image for ECR..."
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URL}:latest

# Step 3: Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_URL}

# Step 4: Create ECR repository if it doesn't exist
echo "Checking/Creating ECR repository..."
aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} 2>/dev/null || \
aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${AWS_REGION}

# Step 5: Push image to ECR
echo "Pushing image to ECR..."
docker push ${ECR_REPO_URL}:latest

# Step 6: Update ECS service (if service exists)
echo "Updating ECS service..."
aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${ECS_SERVICE_NAME} --force-new-deployment --region ${AWS_REGION}

echo "======================================"
echo "Deployment complete!"
echo "Image pushed to: ${ECR_REPO_URL}:latest"
echo "======================================"
