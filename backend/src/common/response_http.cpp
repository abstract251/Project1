#include "response_http.h"
#include <iostream>
#include <fstream>
#include "map.h"
using namespace std;

string response_file(string filename)
{
    filename = "../www" + filename;
    ifstream ifs(filename, ios::binary | ios::ate);
    if (!ifs)
    {
        cerr << filename << "文件打开失败！" << endl;
        return "";
    }
    size_t a;
    if (ifs.tellg() < 0)
        a = 0;
    else
        a = (size_t)ifs.tellg();
    ifs.seekg(0, ios::beg);
    string file;
    file.resize(a);
    ifs.read(&file[0], a);
    if (ifs.gcount() < a)
    {
        cerr << filename << "文件读取不完全！" << endl;
        return "";
    }
    if (!ifs.good())
    {
        cerr << filename << "文件读取中出现错误！" << endl;
        return "";
    }
    return file;
}
string response_head(string name, int size)
{
    string head = "HTTP/1.1 200 OK\r\nContent-Type: ";
    head += map(get_tail(name));
    head += "\r\nContent-Length: ";
    head += to_string(size);
    head += "\r\nConnection: close\r\n\r\n";
    return head;
}