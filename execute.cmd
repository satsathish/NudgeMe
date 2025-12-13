docker build -t nudgeme:latest .
helm upgrade nudgeme ./helm/nudgeme/ -n sat
kubectl rollout restart deployment/nudgeme -n sat
kubectl logs -f -l app.kubernetes.io/name=nudgeme -n sat