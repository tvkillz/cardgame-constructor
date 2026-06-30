#!/bin/bash

# =============================================================================
# Voidborn development Rclone Mount Script
# Cleans up previous mounts, kills stale processes, and mounts remote drives
# =============================================================================

set +e

# --- 1. Define Base Paths ---
BASE_VOIDBORN="/home/any/Desktop/constructor-mount"
LOCAL_BACKEND="$BASE_VOIDBORN/backend"
# LOCAL_FRONTEND="$BASE_VOIDBORN/frontend"
LOCAL_PROJECTS="$BASE_VOIDBORN/projects"
LOCAL_SENDMAIL="$BASE_VOIDBORN/sendmail"
PERSISTENT_CACHE="/home/any/.rclone_cache"

REMOTE_BACKEND="/root/constructor-files/backend"
# REMOTE_FRONTEND="/root/constructor-files/frontend"
REMOTE_PROJECTS="/root/constructor-files/projects"
REMOTE_SENDMAIL="/root/constructor-files/sendmail"

# --- 2. Cleanup Ghost Mounts ---
echo "Cleaning up existing mounts..."

pkill -f "rclone mount sportsy:" || true
# pkill -f "rclone mount voidborn:" || true

fusermount -uz "$LOCAL_BACKEND" 2>/dev/null || true
# fusermount -uz "$LOCAL_FRONTEND" 2>/dev/null || true
fusermount -uz "$LOCAL_PROJECTS" 2>/dev/null || true
fusermount -uz "$LOCAL_SENDMAIL" 2>/dev/null || true

set -e

# --- 3. Rclone Configuration ---
RCLONE_OPTS="
--vfs-cache-mode full
--vfs-cache-max-size 5G
--vfs-cache-max-age 168h
--vfs-read-chunk-size 32M
--vfs-read-chunk-size-limit 256M
--buffer-size 64M
--dir-cache-time 1000h
--poll-interval 15s
--vfs-write-back 0s
--async-read=true
--no-modtime
"

# --- 4. Create Local Directories ---
echo "Creating local directories..."
# mkdir -p "$LOCAL_BACKEND" "$LOCAL_FRONTEND" "$LOCAL_PROJECTS"

# --- 5. Mounting Remote Drives ---
echo "Mounting voidborn server..."

rclone mount "sportsy:$REMOTE_BACKEND" "$LOCAL_BACKEND" \
    $RCLONE_OPTS --cache-dir "$PERSISTENT_CACHE/voidborn/constructor-backend" &

rclone mount "sportsy:$REMOTE_PROJECTS" "$LOCAL_PROJECTS" \
    $RCLONE_OPTS --cache-dir "$PERSISTENT_CACHE/voidborn/constructor-projects" &

rclone mount "voidborn:$REMOTE_SENDMAIL" "$LOCAL_SENDMAIL" \
     $RCLONE_OPTS --cache-dir "$PERSISTENT_CACHE/voidborn/constructor-sendmail" &

# --- 6. Status ---
echo "------------------------------------------"
echo "All mounts active with isolated caches."
echo "  Backend:  $LOCAL_BACKEND  (sportsy)"
echo "  Projects: $LOCAL_PROJECTS  (sportsy)"
echo "  SENDMAIL: $LOCAL_SENDMAIL  (voidborn)"
echo "------------------------------------------"

# --- 7. Keep script running ---
sleep infinity
