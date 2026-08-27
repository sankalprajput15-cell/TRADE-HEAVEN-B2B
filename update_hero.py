import re

with open('src/components/marketplace/HeroSection.tsx', 'r') as f:
    content = f.read()

if "EditableText" not in content:
    content = content.replace("import { SafeImage } from '../common/SafeImage';", "import { SafeImage } from '../common/SafeImage';\nimport { EditableText } from '../EditableText';\nimport { EditableImage } from '../EditableImage';")

# Replacing hero headline
headline_static = """          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
            Connect Directly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Verified Global</span> Suppliers.
          </h1>"""
headline_editable = """          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6 flex flex-wrap gap-2">
            <EditableText contentKey="homepage.heroHeadline" defaultText="Connect Directly with" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              <EditableText contentKey="homepage.heroHeadlineGradient" defaultText="Verified Global" />
            </span>
            Suppliers.
          </h1>"""
content = content.replace(headline_static, headline_editable)

subheadline_static = """          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl font-normal leading-relaxed">
            Trade Heaven connects manufacturers, exporters, and buyers globally with transparent pricing, verified credentials, and secure cross-border logistics.
          </p>"""
subheadline_editable = """          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl font-normal leading-relaxed">
            <EditableText contentKey="homepage.heroSubheadline" defaultText="Trade Heaven connects manufacturers, exporters, and buyers globally with transparent pricing, verified credentials, and secure cross-border logistics." />
          </p>"""
content = content.replace(subheadline_static, subheadline_editable)

bg_static = """      <div className="absolute inset-0 z-0 bg-slate-900">
        <SafeImage
          src={hp.heroBgImage || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=85"}
          alt="Global Trade"
          className="w-full h-full object-cover opacity-30"
          fallbackSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/95" />
      </div>"""
bg_editable = """      <div className="absolute inset-0 z-0 bg-slate-900">
        <EditableImage
          contentKey="homepage.heroBgImage"
          defaultSrc="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=85"
          alt="Global Trade"
          className="w-full h-full opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/95 pointer-events-none" />
      </div>"""
content = content.replace(bg_static, bg_editable)

with open('src/components/marketplace/HeroSection.tsx', 'w') as f:
    f.write(content)
