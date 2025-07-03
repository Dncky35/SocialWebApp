param (
    [string]$Command = "run"
)

$ImageName = "socialwebapp"
$DockerDir = "server"
$EnvFile = "$DockerDir/.env"

switch ($Command) {
    "build" {
        docker build -t $ImageName $DockerDir
    }
    "stop" {
        docker stop $ImageName
        docker rm $ImageName
    }
    "run" {
        docker stop $ImageName
        docker rm $ImageName
        docker build -t $ImageName $DockerDir
        docker run -d --env-file $EnvFile -p 8000:8000 --name $ImageName $ImageName
    }
    "logs" {
        docker logs -f $ImageName
    }
    "clean" {
        docker stop $ImageName
        docker rm $ImageName
        docker rmi $ImageName
    }
    default {
        Write-Host "Unknown command: $Command"
    }
}
