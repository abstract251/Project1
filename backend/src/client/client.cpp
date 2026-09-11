#include <iostream>
#include <unistd.h>
#include <cstring>
#include "socket.h"
#include "error.h"
using namespace std;

int main()
{
    struct Socket s;
    s.CreateSocket();
    s.Connect();
    while (true)
    {
        char buf[1024];
        memset(buf, 0, sizeof(buf));
        cin.getline(buf, sizeof(buf));

        ssize_t len = write(s.GetSocketfd(), buf, sizeof(buf));
        if (len > 0)
        {
            cout << "客户端fd" << s.GetSocketfd() << "已向服务器发送数据" << buf << endl;
        }
        else if (len == 0)
        {
            cout << "客户端" << s.GetSocketfd() << "数据发送完毕" << endl;
        }
        else
        {
            errif(true, "客户端fd为${s.GetSocketfd()}的数据发送失败了");
            break;
        }
        memset(buf, 0, sizeof(buf));
        ssize_t len2 = read(s.GetSocketfd(), buf, sizeof(buf));
        if (len2 > 0)
        {
            cout << "客户端" << s.GetSocketfd() << "接收到服务器数据: " << buf << endl;
        }
        else if (len2 == 0)
        {
            cout << "客户端" << s.GetSocketfd() << "数据读取完毕" << endl;
            break;
        }
        else
        {
            errif(true, "客户端fd为${s.GetSocketfd()}的数据读取失败了");
            close(s.GetSocketfd());
            break;
        }
    }
}