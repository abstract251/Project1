#include <cstring>
#include <unistd.h>
#include <errno.h>
#include "request_get.h"
#include <iostream>
using namespace std;
vector<string> get_line(int socket)
{
    vector<string> vec;
    string line;
    char a = 0;
    while (true)
    {
        ssize_t len = read(socket, &a, sizeof(a));
        if (len > 0)
        {
            if (a != '\n')
            {
                line.push_back(a);
            }
            else
            {
                line.push_back(a);
                vec.push_back(line);
                line.clear();
            }
        }
        else if (len == 0)
        {
            if (!line.empty())
            {
                vec.push_back(line);
                line.clear();
            }
            cout << "客户端断开连接！" << endl;
            break;
        }
        else if (len == -1 && errno == EINTR)
        {
            cout << "客户端正常中断，继续读取！" << endl;
            continue;
        }
        else if (len == -1 && (errno == EAGAIN || errno == EWOULDBLOCK))
        {
            if (!line.empty())
            {
                vec.push_back(line);
                line.clear();
            }
            cout << "数据读取完毕" << endl;
            break;
        }
        else
        {
            cout << "发生了其它的错误！" << endl;
            break;
        }
    }
    return vec;
}

vector<string> request_line(string a)
{
    vector<string> vec;
    string line;
    for (int i = 0; i < a.size(); i++)
    {
        if (a[i] == ' ' || a[i] == '\r' || a[i] == '\n')
        {
            if (!line.empty())
            {
                vec.push_back(line);
                line.clear();
            }
            continue;
        }
        else
            line.push_back(a[i]);
    }
    return vec;
}
vector<string> request_head(string a)
{
    vector<string> vec;
    return vec;
}