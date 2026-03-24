# Build stage
FROM golang:1.23-alpine AS builder

# CGO required for SQLite driver
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o app hello.go

# Runtime stage
FROM alpine:3.19
RUN apk add --no-cache sqlite-libs

WORKDIR /app
COPY --from=builder /app/app .

ENV PORT=8080
ENV GIN_MODE=release
ENV DB_PATH=/tmp/conduit.db

EXPOSE 8080
CMD ["./app"]
