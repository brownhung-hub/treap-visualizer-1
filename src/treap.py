import random, json

random.seed(67)
_roots=[]
log=[]
class node():
    def __init__(self, val:int):
        self.val=val
        self.mx=val
        # self.id=id
        self.sz=1
        self.hid=random.random()
        self.l:node|None=None
        self.r:node|None=None
        self.highlight=0 # 0=default, 1=on, -1=off 
    
    def pull(self):
        self.sz=1
        self.mx=self.val
        if self.l: 
            self.mx=max(self.l.mx, self.mx)
            self.sz += self.l.sz
        if self.r:
            self.mx=max(self.r.mx, self.mx)
            self.sz += self.r.sz

def merge(a:node, b:node):
    global log, _roots
    if not a or not b:
        return a or b
    log.append({"name":"merge: start","data":print_treap(_roots, [a,b])})
    if a.hid > b.hid:
        # no push
        log.append({"name":"merge: left is top","data":print_treap(_roots, [a,b])})
        a.r = merge(a.r, b)
        a.pull()
        return a
    else:
        log.append({"name":"merge: right is top","data":print_treap(_roots, [a,b])})
        b.l= merge(a, b.l)
        b.pull()
        return b

# left part has size = k
# highlight left side
def spilt(cur: node, k:int): # -> a, b
    global log, _roots
    if not cur:
        return None, None

    log.append({"name":"spilt: start","data":print_treap(_roots, [cur])})
    if k == 0: 
        return None, cur
    
    # no push
    lsz = cur.l.sz if cur.l else 0
    if lsz >= k:
        cur.highlight=-1
        if cur.l: cur.l.highlight=1
        log.append({"name":"spilt: exclude self, go left","data":print_treap(_roots, [cur])})

        a, cur.l = spilt(cur.l, k)
        cur.pull()
        return a, cur
    else:
        cur.highlight=1
        if cur.r: cur.r.highlight=-1
        log.append({"name":"spilt: include self, go right","data":print_treap(_roots, [cur])})

        cur.r, b = spilt(cur.r, k - lsz - 1)
        cur.pull()

        return cur, b

def reset_hili(node:node):
    if not node: return
    node.highlight=0
    reset_hili(node.l)
    reset_hili(node.r)

def print_treap(roots, cur=None):
    def build_dict(node:node, prvh, cur):
        if not node:
            return None

        ret= {
            "node_id": str(id(node)),  # 利用 id() 產生唯一標識符
            # "node_id": node.id,
            "val": node.val,
            "priority": round(node.hid, 6),  # 取小數點後 6 位讓版面更簡潔
            "range_max": node.mx
        }

        if node.highlight==1 or (node.highlight==0 and prvh==1):
            ret["highlight1"]=True
            prvh=1
        else: prvh=-1

        if cur and node in cur: ret["highlight2"]=True

        ret["left"]=build_dict(node.l, prvh, cur)
        ret["right"]=build_dict(node.r, prvh, cur)

        if not node.l and node.r:
            ret["left"]={
                "node_id": ret["node_id"]+"_null",
                "isEmpty": True
            }
        elif not node.r and node.l:
            ret["right"]={
                "node_id": ret["node_id"]+"_null",
                "isEmpty": True
            }
        
        return ret
    
    vroot={
        "isVirtual": True,
        "node_id": "vroot",
        "children":[
            build_dict(root, -1, cur) for root in roots if root
        ]
    }
    return vroot

def spilt_with_log(cur, l,r):
    global _roots, log
    k=r-l+1
    log.append({"name":f"Spilt with left = [ {l}, {r} ] -> size {k}","data":print_treap(_roots)})
    a,b=spilt(cur,k)
    _roots.pop()
    _roots.append(a)
    _roots.append(b)
    log.append({"name":"Finish spilt","data":print_treap(_roots)})
    reset_hili(a)
    reset_hili(b)
    # log.append({"name":"finish spilt","data":print_treap(_roots)})
    return a,b

def merge_with_log(a,b):
    global _roots, log
    if a and b: 
        a.highlight=1
        b.highlight=1
        log.append({"name":f"Merge two treaps","data":print_treap(_roots)})
        b.highlight=0
    ret=merge(a,b)
    _roots.pop()
    _roots.pop()
    _roots.append(ret)
    if a and b:
        log.append({"name":"Finish merge","data":print_treap(_roots)})
        reset_hili(ret)
    log.append({"name":"Finish merge","data":print_treap(_roots)})
    return ret

class Treap():
    global _roots, log
    def __init__(self):
        self.root : node | None =None
        _roots.append(self.root)

    def query(self, l, r): # root will not change, -> int
        if not self.root: raise ValueError("Treap is empty")
        if l > r: raise ValueError("l must be <= r")
        if l <= 0 or r > self.root.sz: raise ValueError("Index out of bounds")
        a, b= spilt_with_log(self.root, 1, l-1)
        b, c= spilt_with_log(b, l, r)
        ans = b.mx
        merge_with_log(a, merge_with_log(b,c))
        return ans

    def insert(self, k, val): # -> void
        print(f"insert: {k} {val}")
        current_sz = self.root.sz if self.root else 0
        if k < 0 or k > current_sz: raise ValueError("Index out of bounds")
        a,b=spilt_with_log(self.root, 1, k)
        newnode=node(val)
        tmp=_roots.pop()
        _roots.append(newnode)
        _roots.append(tmp)
        log.append({"name":"Add node {val}","data":print_treap(_roots)})
        self.root = merge_with_log(a, merge_with_log(newnode, b))

    def remove(self, k): # -> void
        if not self.root: raise ValueError("Treap is empty")
        if k <= 0 or k > self.root.sz: raise ValueError("Index out of bounds")
        a,b= spilt_with_log(self.root, 1, k-1)
        b,c= spilt_with_log(b,k,k)
        _roots.pop()
        _roots.pop()
        _roots.append(c)
        log.append({"name":"Delete node","data":print_treap(_roots)})
        del b
        
        self.root= merge_with_log(a,c)
    
    def clear(self):
        self.root=None
        _roots.clear() # no memory free
        _roots.append(self.root)
        log.append({"name":"clear","data":print_treap(_roots)})
    
    def build(self, nodes): # nodes[i]=val, -> void
        self.root=None
        _roots.clear() # no memory free
        _roots.append(self.root)
        for i in nodes:
            self.root=merge(self.root, node(i))
        _roots.pop()
        _roots.append(self.root)
        log.clear()
        log.append({"name":"initialize","data":print_treap(_roots)})

def flush_log():
    global log
    # return log
    # print(json.dumps(log, indent=4)) # for debugging
    res, log = log, []
    return res

if __name__=='__main__':
    t = Treap()
    t.insert(0,3)
    flush_log()
    t.build([4,8,7,6])
    print(flush_log())
    # print("--------------------------")
    # t.remove(2)
    # flush_log()
    # print("--------------------------")
    # t.query(3,5)
    # print(flush_log())