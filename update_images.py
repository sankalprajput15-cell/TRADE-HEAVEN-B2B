import re
import os

# Curated pools of high quality, relevant Unsplash photos for each category/keyword

IMAGE_POOLS = {
    'gold': [
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80", # gold bars
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80", # golden texture
        "https://images.unsplash.com/photo-1624365168968-f283d5162df9?w=800&auto=format&fit=crop&q=80", # gold bullion
        "https://images.unsplash.com/photo-1618403088890-3d9fb6f4c8b1?w=800&auto=format&fit=crop&q=80", # gold coins stack
        "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80", # gold coins
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80", # gold jewelry bars
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80", # raw gold mineral
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80", # gold ingot stack
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80", # gold reflections
        "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80", # investment gold
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80", # finance market gold
        "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&auto=format&fit=crop&q=80", # gold luxury
        "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&auto=format&fit=crop&q=80", # gold nuggets
        "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&auto=format&fit=crop&q=80", # minted gold
        "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&auto=format&fit=crop&q=80", # gold ingot vault
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80", # wealth gold
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80", # refined gold
        "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80", # bullion vault
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80", # currency gold
        "https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=800&auto=format&fit=crop&q=80", # 999.9 gold
        "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80", # gold alloy
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80", # corporate bullion
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=80", # gold coins close
        "https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=800&auto=format&fit=crop&q=80", # gold assay
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80", # gold refinery
        "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800&auto=format&fit=crop&q=80", # gold standard
        "https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=800&auto=format&fit=crop&q=80", # bullion bar close
        "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80", # gold shine
        "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80", # minted coins
        "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80", # gold medal
        "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?w=800&auto=format&fit=crop&q=80", # gold jewelry casting
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80", # golden glow
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80", # gold leaf
        "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80", # gold grain
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80", # luxury metal
        "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80", # precious mineral
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", # tech gold bonding
        "https://images.unsplash.com/photo-1569025743873-ea3a9ada89f9?w=800&auto=format&fit=crop&q=80", # gold refinery plant
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80", # vault safe
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80", # gold reserves
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80", # gold investment
    ]
}

print("Loaded gold pool with", len(IMAGE_POOLS['gold']), "images")
