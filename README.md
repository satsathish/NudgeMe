# NudgeMe


docker compose up -d --build
helm install nudgeme ./helm/nudgeme/ --namespace sat --create-namespace


For Local Testing with connecting databsae
run the command : 
kubectl port-forward svc/nudgeme-postgresql 5432:5432 -n sat