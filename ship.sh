#!/bin/sh
# Usage: sh ship.sh <tag-name>   — commit everything, tag it, push commit + tag.
set -e
TAG="$1"
[ -z "$TAG" ] && { echo "Usage: sh ship.sh <tag-name>"; exit 1; }
git add -A
git commit -m "$TAG" || echo "(nothing new to commit — tagging current commit)"
git tag "$TAG"
git push
git push origin "$TAG"
echo "Shipped $TAG"
