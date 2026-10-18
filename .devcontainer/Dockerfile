# 開発コンテナのベースは Microsoft 提供の TypeScript/Node イメージ
# 配布元: Microsoft 公式 (mcr.microsoft.com)。Dev Containers 用途で広く使われ信頼性が高い
FROM mcr.microsoft.com/devcontainers/typescript-node:20

ARG TERRAFORM_VERSION=1.15.8

# unzip: Terraform バイナリの解凍に使用
# less, jq: AWS CLI やデバッグ時の出力整形に使用
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip less jq python3-pip \
    && rm -rf /var/lib/apt/lists/*

# CPU アーキテクチャを判定し、各ツールの正しいバイナリを選ぶ
# Apple Silicon (arm64) と Intel (amd64) の両方に対応するため
# 各ツールでアーキ表記が異なる: AWS CLI=x86_64/aarch64、SAM=x86_64/arm64、Terraform=amd64/arm64
RUN DPKG_ARCH="$(dpkg --print-architecture)" \
    && case "${DPKG_ARCH}" in \
         amd64) AWSCLI_ARCH="x86_64"; SAM_ARCH="x86_64"; TF_ARCH="amd64" ;; \
         arm64) AWSCLI_ARCH="aarch64"; SAM_ARCH="arm64"; TF_ARCH="arm64" ;; \
         *) echo "未対応のアーキテクチャ: ${DPKG_ARCH}" >&2; exit 1 ;; \
       esac \
    # Terraform (HashiCorp 公式バイナリ)
    && curl -fsSL "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TF_ARCH}.zip" -o /tmp/terraform.zip \
    && unzip -q /tmp/terraform.zip -d /usr/local/bin \
    && rm /tmp/terraform.zip \
    # AWS CLI v2 (AWS 公式)
    && curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-${AWSCLI_ARCH}.zip" -o /tmp/awscliv2.zip \
    && unzip -q /tmp/awscliv2.zip -d /tmp \
    && /tmp/aws/install \
    && rm -rf /tmp/aws /tmp/awscliv2.zip \
    # AWS SAM CLI (AWS 公式)。HTTP API + Lambda のローカル実行に使用。latest から取得しバージョン切れを避ける
    && curl -fsSL "https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-${SAM_ARCH}.zip" -o /tmp/sam.zip \
    && unzip -q /tmp/sam.zip -d /tmp/sam-installation \
    && /tmp/sam-installation/install \
    && rm -rf /tmp/sam.zip /tmp/sam-installation

# docker CLI
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*