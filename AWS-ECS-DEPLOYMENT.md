# AWS ECS Deployment Guide for Attendance App

## Prerequisites
1. AWS Account
2. AWS CLI installed and configured (`aws configure`)
3. Docker installed
4. Permissions for ECS, ECR, VPC, CloudWatch

## Quick Setup

### Step 1: Update Configuration Files

1. **deploy-to-ecs.sh** - Update these variables:
   - `AWS_ACCOUNT_ID`: Your AWS account ID (find in AWS Console)
   - `AWS_REGION`: Your preferred region (e.g., us-east-1)
   - `ECR_REPO_NAME`: Keep as "attendance-app" or change
   - `ECS_CLUSTER_NAME`: Your ECS cluster name
   - `ECS_SERVICE_NAME`: Your ECS service name

2. **ecs-task-definition.json** - Update:
   - Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID
   - Update region if not using us-east-1

### Step 2: Create AWS Resources (First Time Only)

```bash
# Set your region
export AWS_REGION=us-east-1

# 1. Create CloudWatch Log Group
aws logs create-log-group --log-group-name /ecs/attendance-app --region $AWS_REGION

# 2. Create ECS Cluster
aws ecs create-cluster --cluster-name attendance-cluster --region $AWS_REGION

# 3. Create task execution role (if not exists)
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

# 4. Attach policy to role
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# 5. Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region $AWS_REGION
```

### Step 3: Create ECS Service with Load Balancer

You'll need:
- VPC with at least 2 public subnets
- Security group allowing inbound traffic on port 80
- Application Load Balancer (ALB) with target group

```bash
# Create ECS Service (update subnet-xxx and sg-xxx with your values)
aws ecs create-service \
  --cluster attendance-cluster \
  --service-name attendance-service \
  --task-definition attendance-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/NAME/ID,containerName=attendance-app,containerPort=80" \
  --region $AWS_REGION
```

### Step 4: Build and Deploy

```bash
# Make the deployment script executable
chmod +x deploy-to-ecs.sh

# Run deployment
./deploy-to-ecs.sh
```

## Alternative: Manual Deployment Steps

```bash
# 1. Build Docker image
docker build -t attendance-app:latest .

# 2. Test locally (optional)
docker run -p 8080:80 attendance-app:latest
# Visit http://localhost:8080

# 3. Tag for ECR
docker tag attendance-app:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/attendance-app:latest

# 4. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# 5. Push to ECR
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/attendance-app:latest

# 6. Update ECS service
aws ecs update-service --cluster attendance-cluster --service attendance-service --force-new-deployment --region us-east-1
```

## Using AWS Console (GUI Method)

1. **ECR (Elastic Container Registry)**:
   - Create repository named "attendance-app"
   - Push Docker image using commands above

2. **ECS Cluster**:
   - Create new cluster (Fargate)
   - Name: "attendance-cluster"

3. **Task Definition**:
   - Create new task definition
   - Launch type: Fargate
   - CPU: 0.25 vCPU (256)
   - Memory: 0.5 GB (512)
   - Add container with your ECR image
   - Port mapping: 80

4. **Service**:
   - Create service in cluster
   - Launch type: Fargate
   - Task definition: attendance-task
   - Service name: attendance-service
   - Number of tasks: 1
   - Configure networking (VPC, subnets, security group)
   - Optional: Add load balancer

5. **Access**:
   - Use task's public IP (if enabled)
   - Or use Load Balancer DNS name

## Cost Estimation (Fargate)

- **Fargate (0.25 vCPU, 0.5 GB)**:
  - ~$0.012/hour = ~$8.64/month (running 24/7)
  - ~$0.40/day
  
- **ALB (Application Load Balancer)**:
  - ~$16/month base cost
  - Plus data transfer

- **Total**: ~$25-30/month for small usage

## Optimization Tips

1. **Reduce costs**: Use Fargate Spot (up to 70% cheaper)
2. **Auto-scaling**: Configure based on CPU/memory
3. **CloudFront**: Add CDN for better performance and caching
4. **Route 53**: Add custom domain
5. **Certificate Manager**: Add HTTPS/SSL

## Monitoring

- **CloudWatch Logs**: `/ecs/attendance-app`
- **ECS Console**: View task status, logs, metrics
- **CloudWatch Alarms**: Set up for CPU, memory, health checks

## Troubleshooting

```bash
# View service events
aws ecs describe-services --cluster attendance-cluster --services attendance-service --region us-east-1

# View task logs
aws logs tail /ecs/attendance-app --follow --region us-east-1

# List running tasks
aws ecs list-tasks --cluster attendance-cluster --region us-east-1

# Describe task
aws ecs describe-tasks --cluster attendance-cluster --tasks TASK_ID --region us-east-1
```

## Updating the App

After making code changes:
```bash
# 1. Build production version
npm run build

# 2. Run deployment script
./deploy-to-ecs.sh
```

The script will rebuild the Docker image, push to ECR, and force ECS to deploy the new version.

## Clean Up (Delete Everything)

```bash
# Delete service
aws ecs delete-service --cluster attendance-cluster --service attendance-service --force --region us-east-1

# Delete cluster
aws ecs delete-cluster --cluster attendance-cluster --region us-east-1

# Delete ECR images
aws ecr batch-delete-image --repository-name attendance-app --image-ids imageTag=latest --region us-east-1

# Delete ECR repository
aws ecr delete-repository --repository-name attendance-app --force --region us-east-1

# Delete log group
aws logs delete-log-group --log-group-name /ecs/attendance-app --region us-east-1
```
