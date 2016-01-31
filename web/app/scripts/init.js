var
    // Set hosts so we can detect local, staging, production.
    brand = "Walking Penguins",
    hosts = {
        'localhost:8080'                : 'local',
        'localhost:3000'                : 'local',
        'staging.walkingpenguins.com'   : 'staging',
        'walkingpenguins.com'           : 'production',
        'walkingpenguins.com'           : 'roadhouse'
    },
    // Set API servers for local, staging, production.
    server_uris = {
        'local'      : 'localhost:3000',
        'staging'    : 'staging.walkingpenguins.com',
        'production' : 'walkingpenguins.com',
        'roadhouse'  : 'walkingpenguins.com'
    },
    current_environment = false,
    cert                = 'cert/public.key.pem',
    app_server          = '';

// Set the current environment based on detected hostname.
if (hosts.hasOwnProperty(window.location.host)) {
    // This is not a branded dashboard, this is GC local, staging, or production.
    current_environment = hosts[window.location.host];
} 

app_server = '//' + server_uris[current_environment];
