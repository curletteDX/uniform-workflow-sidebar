# Uniform Workflow Sidebar

A MESH integration that adds a visual workflow timeline to the Uniform Canvas editor sidebar.

## Features

- Visual timeline showing workflow stages
- Current stage highlighted with purple accent
- Previous/Next navigation buttons
- Works with compositions, patterns, and entries

## Installation

### 1. Deploy the Integration

Deploy this Next.js app to Vercel or another hosting provider.

### 2. Register in Uniform

1. Go to your Uniform Team Settings → Custom Integrations
2. Create a new integration
3. Paste the contents of `public/mesh-manifest.json`
4. Update the URLs to point to your deployed app

### 3. Install on Project

1. Go to your Project → Integrations
2. Find "Workflow Sidebar" and install it
3. The workflow tool will appear in the Canvas editor side rail

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Manifest Configuration

The `mesh-manifest.json` configures which editor contexts show the workflow tool:

- `composition` - Composition editor
- `componentPattern` - Component pattern editor  
- `entry` - Entry editor
- `entryPattern` - Entry pattern editor

## Customization

### Workflow Stages

The component automatically detects the workflow assigned to the composition/entry. If no workflow is assigned, it shows a demo workflow.

### Colors

Edit the `colors` object in `components/WorkflowTimeline.tsx` to match your brand:

```typescript
const colors = {
  purple: '#6366F1',  // Accent color
  // ...
};
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Uniform Dashboard           │
│  ┌───────────────────────────────────┐  │
│  │         Canvas Editor             │  │
│  │  ┌─────────┐  ┌────────────────┐  │  │
│  │  │ Side    │  │    Editor      │  │  │
│  │  │ Rail    │  │    Content     │  │  │
│  │  │         │  │                │  │  │
│  │  │ [Workflow│ │                │  │  │
│  │  │  Tool]  │  │                │  │  │
│  │  │   ↓     │  │                │  │  │
│  │  │ iframe  │  │                │  │  │
│  │  └─────────┘  └────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼ (iframe loads)
┌─────────────────────────────────────────┐
│     This Integration (Next.js App)      │
│                                         │
│   /editor-tool                          │
│   ├── UniformMeshSdkContextProvider     │
│   │   └── EditorToolContent             │
│   │       └── WorkflowTimeline          │
│   │           ├── Header                │
│   │           ├── Timeline Stages       │
│   │           └── Footer Buttons        │
└─────────────────────────────────────────┘
```

## License

MIT
