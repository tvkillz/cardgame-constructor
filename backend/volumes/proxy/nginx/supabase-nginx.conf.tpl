upstream kong_upstream {
    server kong:8000;
    keepalive 2;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# Platform API only — frontends live on separate VPS(s). TLS on ${PROXY_DOMAIN} (e.g. voidborn.fun).
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name ${PROXY_DOMAIN};
    server_tokens off;

    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header X-Forwarded-Port $server_port;

    ssl_certificate /etc/letsencrypt/live/${PROXY_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PROXY_DOMAIN}/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${PROXY_DOMAIN}/chain.pem;
    ssl_dhparam /etc/letsencrypt/dhparams/dhparam.pem;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    large_client_header_buffers 4 16k;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location /auth {
        proxy_pass http://kong_upstream;
    }

    location /rest {
        proxy_pass http://kong_upstream;
    }

    location /graphql {
        proxy_pass http://kong_upstream;
    }

    location /storage/v1/ {
        proxy_pass http://kong_upstream;
        proxy_buffering off;
        proxy_request_buffering off;
        chunked_transfer_encoding off;
        client_max_body_size 0;
    }

    location /functions {
        proxy_pass http://kong_upstream;
    }

    location /sso {
        proxy_pass http://kong_upstream;
    }

    location / {
        return 404;
    }
}
