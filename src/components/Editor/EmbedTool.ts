interface EmbedToolData {
  url: string;
  caption?: string;
}

interface EmbedToolConstructorProps {
  data: EmbedToolData;
  config: any;
  api: any;
  readOnly: boolean;
}

const providerCheckers = [
  {
    name: "youtube",
    match: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/,
    format: (id: string) => `https://www.youtube.com/embed/${id}`,
  },
  {
    name: "vimeo",
    match: /vimeo\.com\/(\d+)/,
    format: (id: string) => `https://player.vimeo.com/video/${id}`,
  },
  {
    name: "loom",
    match: /loom\.com\/(share|embed)\/([A-Za-z0-9_-]+)/,
    format: (id: string) => `https://www.loom.com/embed/${id}`,
  },
  {
    name: "figma",
    match: /figma\.com\/(file|proto)\/(.+)/,
    format: (match: string) => `https://www.figma.com/embed?embed_host=astra&url=${encodeURIComponent(match)}`,
  },
  {
    name: "drive",
    match: /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/,
    format: (id: string) => `https://drive.google.com/file/d/${id}/preview`,
  },
];

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  try {
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  } catch {
    return trimmed;
  }
}

function buildEmbedUrl(url: string): string {
  const normalized = normalizeUrl(url);

  for (const provider of providerCheckers) {
    const match = normalized.match(provider.match);
    if (match) {
      return provider.format(match[1] || match[2] || match[0]);
    }
  }

  return normalized;
}

export default class EmbedTool {
  data: EmbedToolData;
  config: any;
  api: any;
  readOnly: boolean;
  wrapper: HTMLDivElement;
  input: HTMLInputElement;
  caption: HTMLInputElement;
  placeholder: string;

  static get toolbox() {
    return {
      title: "Embed",
      icon: "<svg width=18 height=18 viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16v16H4z\"/><path d=\"M14 8l4 4-4 4\"/><path d=\"M10 8l-4 4 4 4\"/></svg>",
    };
  }

  static get sanitize() {
    return {
      url: true,
      caption: true,
    };
  }

  constructor({ data, config, api, readOnly }: EmbedToolConstructorProps) {
    this.data = data || { url: "", caption: "" };
    this.config = config || {};
    this.api = api;
    this.readOnly = readOnly;
    this.wrapper = document.createElement("div");
    this.input = document.createElement("input");
    this.caption = document.createElement("input");
    this.placeholder = this.config.placeholder || "Paste a media or embed URL...";
  }

  render() {
    this.wrapper.classList.add("embed-tool");

    if (!this.data.url) {
      const urlLabel = document.createElement("label");
      urlLabel.textContent = "Embed URL";
      urlLabel.className = "embed-tool__label";

      this.input.type = "url";
      this.input.placeholder = this.placeholder;
      this.input.value = this.data.url || "";
      this.input.className = "embed-tool__input";
      this.input.addEventListener("change", () => {
        this.data.url = this.input.value;
      });

      this.caption.type = "text";
      this.caption.placeholder = "Caption (optional)";
      this.caption.value = this.data.caption || "";
      this.caption.className = "embed-tool__caption";
      this.caption.addEventListener("change", () => {
        this.data.caption = this.caption.value;
      });

      this.wrapper.append(urlLabel, this.input, this.caption);
    } else {
      const embedUrl = buildEmbedUrl(this.data.url);
      const preview = document.createElement("div");
      preview.className = "embed-tool__preview";

      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.allow = "autoplay; fullscreen; encrypted-media";
      iframe.allowFullscreen = true;
      iframe.className = "embed-tool__iframe";
      iframe.loading = "lazy";
      preview.appendChild(iframe);

      const captionEl = document.createElement("div");
      captionEl.className = "embed-tool__caption-text";
      captionEl.textContent = this.data.caption || this.data.url;
      preview.appendChild(captionEl);

      this.wrapper.appendChild(preview);
    }

    return this.wrapper;
  }

  save(block: HTMLElement) {
    const url = this.input?.value?.trim() || this.data.url || "";
    const caption = this.caption?.value?.trim() || this.data.caption || "";
    return {
      url,
      caption,
    };
  }

  validate(savedData: EmbedToolData) {
    return typeof savedData.url === "string" && savedData.url.trim().length > 0;
  }

  static get pasteConfig() {
    return {
      tags: ["iframe", "a"],
      patterns: {
        embed: /(https?:\/\/.+)/,
      },
    };
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData("text") || "";
    if (clipboardData) {
      this.data.url = clipboardData;
    }
  }
}
