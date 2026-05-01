# Work with Container Images

Use this skill when asked to build or push container images in this workspace.

## Environment

`buildah` is installed and must be run as root via `sudo`. Always invoke it as:

```bash
sudo _BUILDAH_STARTED_IN_USERNS="" BUILDAH_ISOLATION=chroot buildah <command>
```

## Target registry

Images are pushed to the OpenShift internal registry. Use the MCP `configuration_view` tool to read the current cluster API URL, then derive the registry addresses from it:

- The cluster API URL has the form `https://api.<cluster-domain>:6443`
- The external registry address (for push) is: `default-route-openshift-image-registry.apps.<cluster-domain>`
- The internal registry address (for image refs in manifests) is: `image-registry.openshift-image-registry.svc:5000`

## Authentication

Read the current token and username from the kubeconfig via the MCP `configuration_view` tool, then log in:

```bash
sudo _BUILDAH_STARTED_IN_USERNS="" BUILDAH_ISOLATION=chroot buildah login \
  -u <username-from-kubeconfig> \
  -p <token-from-kubeconfig> \
  default-route-openshift-image-registry.apps.<cluster-domain>
```

## Build

Always build for `linux/amd64` to match the cluster nodes, regardless of the devcontainer's host architecture:

```bash
sudo _BUILDAH_STARTED_IN_USERNS="" BUILDAH_ISOLATION=chroot buildah build \
  --platform linux/amd64 \
  -t default-route-openshift-image-registry.apps.<cluster-domain>/<namespace>/<app-name>:latest \
  .
```

## Push

```bash
sudo _BUILDAH_STARTED_IN_USERNS="" BUILDAH_ISOLATION=chroot buildah push \
  default-route-openshift-image-registry.apps.<cluster-domain>/<namespace>/<app-name>:latest
```

## Redeploying after a push

If the Deployment uses `imagePullPolicy: Always` and the tag hasn't changed (e.g. `:latest`), delete the running pod to force the deployment to pull the updated image:

```bash
kubectl delete pod -n <namespace> -l app=<app-name>
```
