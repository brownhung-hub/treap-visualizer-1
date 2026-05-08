import random

# def find_worst_seed(n):
#     cnt=444728
#     while 1:
#         cnt+=1
#         # set seed to cnt
#         random.seed(cnt)
#         cur = random.random()
#         nxt = random.random()
#         inc=1
#         dec=1
#         for i in range(n-1):
#             if nxt>cur: dec=0
#             else: inc=0
#             if not inc and not dec: break
#             cur=nxt
#             nxt=random.random()
        
#         if inc or dec: return cnt

def find_worst_seed(n=0):
    if n<=13: return 27623162
    else: return -1

if(__name__ == '__main__'):
    n=13
    ans= find_worst_seed(n)
    print(ans)
    random.seed(ans)
    for i in range(n): print(random.random())