"use strict";

var config = {
    http: {
        server  : "127.0.0.1",
        port    : 3000
    },
    database: {
        uri     : "mongodb://localhost/walking-penguins",
        option  : {
            db      : { "native_parser": true },
            server  : { "poolSize" : 3 },
            user    : "",
            pass    : ""
        },
        security: {
            salt_factor     : 10,
            max_login       : 5,
            lock_time       : 7200000
        },
        dbname      : "walkingpenguins"
    },
    oauth: {
        token_expire        : 1800,
        refreshToken_expire : 1209600,
        grantsType          : ["password", "refresh_token", "client_credentials"],
        redirectUri         : "http://localhost:3000/oauth/callback",
        oauth_id            : "nvqDKTZBmwImI4Mw",
        oauth_secret        : "B4B7lEvlAMz6TFlhzSOr7ftpf7EjRK82",
        secret              : "JPGjhmPcRFjYTeF2bYZx71qnVpg6HxiCHLgx9DHNKzDaEkEZYNw89AwJlSEDgbNF",
        header              : "penguin_access_token",
        cookie              : "penguins_auth"
    },
    redis: {
        server  : "172.0.0.1",
        port    : 6379
    }
}

module.exports.config = config;
