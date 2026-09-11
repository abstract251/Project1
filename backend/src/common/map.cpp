#include "map.h"
using namespace std;
string map(string type)
{
    string a = "";
    if (type == "html")
        a = "text/html";
    else if (type == "")
        a = "text/";
    return a;
}
string get_tail(string name)
{
    int i = 0;
    while (i < name.size())
    {
        if (name[i] == '.' && i < name.size() - 1)
            return name.substr(i + 1, name.size());
        else
            i++;
    }
    return "";
}