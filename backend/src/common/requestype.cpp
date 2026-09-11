#include "requestype.h"
#include "response_http.h"
#include <iostream>
using namespace std;
string request_response(string request)
{
    vector<string> vec = request_line(request);
    if (vec[0] == "GET")
    {
        cout << "当前收到的是GET请求" << endl;
        string file = response_file(vec[1]);
        string response = response_head(vec[1], file.size());
        response = response + file;
        return response;
    }
    else if (vec[0] == "POST")
    {
        cout << "当前收到的是POST请求" << endl;
    }
    else if (vec[0] == "PUT")
    {
        cout << "当前收到的是PUT请求" << endl;
    }
    else if (vec[0] == "DELETE")
    {
        cout << "当前收到的是DELETE请求" << endl;
    }
    else if (vec[0] == "HEAD")
    {
        cout << "当前收到的是HEAD请求" << endl;
        string file = response_file(vec[1]);
        string response = response_head(vec[1], file.size());
        return response;
    }
    else if (vec[0] == "OPTIONS")
    {
        cout << "当前收到的是OPTIONS请求" << endl;
    }
    else if (vec[0] == "PATCH")
    {
        cout << "当前收到的是PATCH请求" << endl;
    }
    else if (vec[0] == "CONNECT")
    {
        cout << "当前收到的是CONNECT请求" << endl;
    }
    else if (vec[0] == "TRACE")
    {
        cout << "当前收到的是TRACE请求" << endl;
    }
    else
    {
        cout << "当前收到的是未知类型请求" << endl;
    }
    return "";
}