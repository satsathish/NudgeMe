@REM docker build -t nudgeme:latest .
@REM helm upgrade nudgeme ./helm/nudgeme/ -n sat
@REM kubectl rollout restart deployment/nudgeme -n sat
@REM kubectl logs -f -l app.kubernetes.io/name=nudgeme -n sat

kubectl exec -n sat nudgeme-postgresql-0 -- pg_dump -U nudgeme nudgeme > nudgeme-backup.sql  

kubectl delete  namespace sat

helm install nudgeme .\helm\nudgeme --namespace sat --create-namespace

echo Waiting for all pods to be ready...
kubectl wait --for=condition=ready pod --all -n sat --timeout=300s

kubectl get all -n sat


kubectl exec -i -n sat nudgeme-postgresql-0 -- psql -U nudgeme nudgeme < nudgeme-backup.sql
@REM kubectl get endpoints nudgeme -n sat