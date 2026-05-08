## Treap 前端格式
- Steps: list of {"name":"...", "head":Virtual head}

- Virtual head: 
    - isVirtual: true
        > Dummy head, 所有元素都應在此底下
    - highlight: true (optional)
    - node_id: string
        > 唯一名字
    - children: list of node

- Node: 
    - highlight: true (optional)
    - node_id: string
    - val: int 
    - priority: double
    - range_max: int
    - isEmpty: bool, defaut false
        > 若parent只有左和右的其中一個，空的那個創建虛擬節點，加此參數  
        > (維持原左右邊更能顯示tree特性)
    - left: Node/null
    - right: Node/null

## Python Api Design
> Flask calls these functions.  
> Every api will return json{"success":True/False, "data":...}  
> 1 base  
- `set_seed((int)seed) -> void`
    > Default seed: 48763
- `find_worst_seed() -> int`
- `treap_insert((int)pos, (string)id, (int)val) -> Steps`
- `treap_remove((int)pos) -> Steps`
- `treap_query((int)l, (int)r) -> Steps`
    > ans is in "name", [l,r]
- `treap_build(nodes) -> Steps`

## Frontend entry
- `api/(function name)`

## Frontend layout
- Do not display or pass node_id. Use position to locate(which is the normal usage of treap).