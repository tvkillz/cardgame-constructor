#!/bin/bash

BASE_VOIDBORN="/home/any/Desktop/constructor-mount"
LOCAL_BACKEND="$BASE_VOIDBORN/backend"
LOCAL_FRONTEND="$BASE_VOIDBORN/frontend"
LOCAL_PROJECTS="$BASE_VOIDBORN/projects"

echo "Stopping rclone processes..."
pkill -f "rclone mount sportsy:" || true
pkill -f "rclone mount voidborn:" || true
sleep 1

echo "Unmounting rclone mounts (lazy)..."

MOUNTS=(
    "$LOCAL_BACKEND"
    "$LOCAL_PROJECTS"
    "$LOCAL_FRONTEND"
)

for mnt in "${MOUNTS[@]}"; do
    if [ -d "$mnt" ]; then
        echo "Unmounting $mnt..."
        fusermount -uz "$mnt" || true
        sudo umount -fl "$mnt" 2>/dev/null || true
    fi
done

echo "Cleanup done."
