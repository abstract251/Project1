#include "connect.h"
#include "socket.h"
#include "event_loop.h"
#include "channel.h"
#include <unistd.h>
#include <iostream>
Connect::Connect(Socket *socket, EventLoop *loop)
{
    socketfd = socket->Accept();
    channel = new Channel(loop, socketfd);
    std::function<void()> lambda = [this]()
    { this->Handle(); };
    channel->SetCallBack(lambda);
    channel->Read();
}

void Connect::SetCallBack(std::function<void()> lambda)
{
    callback = lambda;
}

void Connect::Handle()
{
    while (true)
    {
        char buf[1024];
        memset(buf, 0, sizeof(buf));
        int n = read(socketfd, buf, sizeof(buf));
        if (n > 0)
        {
            std::cout << buf << std::endl;
            write(socketfd, "收到了，OK", 15);
        }
        else if (n == 0)
        {
            std::cout << "客户端断开连接" << std::endl;
            callback();
            break;
        }
        else if (n == -1 && errno == EINTR)
        {
            std::cout << "客户端正常中断，继续读取" << std::endl;
            continue;
        }
        else if (n == -1 && (errno == EAGAIN || errno == EWOULDBLOCK))
        {
            std::cout << "数据读取完毕" << std::endl;
            break;
        }
        else
        {
            std::cout << "未知类型" << std::endl;
            break;
        }
    }
}
int Connect::Get()
{
    return socketfd;
}
Connect::~Connect()
{
    delete channel;
}