#include <sys/socket.h>
#include <arpa/inet.h>
#include <cstring>
#include <string>
#pragma once
class Socket
{
public:
    int CreateSocket();
    int CreateSocket(const int a, std::string b);
    void BindSocket();
    void Listen();
    int Accept();
    bool Connect();
    int GetSocketfd();
    Socket();
    Socket(int fd);
    ~Socket();

private:
    int Port = 3000;
    std::string IP = "127.0.0.1";
    struct sockaddr_in sock;
    struct sockaddr_in sock1;
    int socketfd;
};