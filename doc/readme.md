後端:給一個treap array，會照順序播放

每個節點有node_id，這是不能改的，確保重新畫的時候是同一個點，這樣畫面不會閃爍

固定給一個虛擬根節點 isVirtual: true (不會印出來)
如果有三棵樹要印，用這個虛擬根把它們包成一顆然後傳過來
為了方便，只有一顆的時候也要有虛擬根

確保每個點都要有兩個以上child，只有一個child會被畫在正下方
如果只有一個，要補上一個空節點 標上isEmpty: true，這樣會是透明的

可以標上highlight: true 來變色

範例:
```
{
  "isVirtual": true,
  "node_id": "vroot",
  "children": [
    {
      "node_id": "n_50",
      "val": 50,
      "priority": 0.92,
      "range_max": 80, 
      "tree_id": "A",
      "left": {
        "node_id": "n_20",
        "val": 20,
        "priority": 0.85,
        "range_max": 20,
        "left": null,
        "right": { "node_id": "n_20_R_null", "isEmpty": true }
      },
      "right": {
        "node_id": "n_80",
        "val": 80,
        "priority": 0.70,
        "range_max": 80,
        "left": null,
        "right": null
      }
    }
  ]
}
```

index:主檔案
     
d3-logic:重新畫treap的邏輯 需要改動畫要去那裏

style:改按鈕大小字體等

app:1l 包含按下按鈕的事件、傳輸入給後端、從後端讀treap、播放測試等
