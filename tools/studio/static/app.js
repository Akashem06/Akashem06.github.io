"use strict";

let SCHEMA = { fields: {}, hasBody: {} };
let currentKind = "gallery";
let currentId = null; // null = creating new
let ALBUMS = null; // cached gallery folders for the album autocomplete

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  for (const k of kids) n.append(k);
  return n;
};
const assetUrl = (p) => (p ? "/asset/" + String(p).replace(/^\//, "") : "");
// Matches photo_tool.slugify so client-computed media folders line up with the
// .md filename the server writes (project title / experience company).
const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const mediaFolder = () => {
  const key = currentKind === "experiences" ? "company" : "title";
  const f = $(`[data-field="${key}"]`);
  return slugify(f ? f.value : "");
};

async function api(method, url, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.status === 204 ? null : res.json();
}

function toast(msg, isError = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("toast--error", isError);
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 3000);
}

// --- list ------------------------------------------------------------------
async function loadList() {
  $("#list-title").textContent = currentKind[0].toUpperCase() + currentKind.slice(1);
  const items = await api("GET", `/api/content/${currentKind}`);
  const cards = $("#cards");
  cards.replaceChildren();
  if (!items.length) {
    cards.append(el("p", { className: "empty" }, "Nothing here yet."));
    return;
  }
  for (const it of items) {
    const thumb = it.image
      ? el("img", { src: assetUrl(it.image), loading: "lazy", alt: "" })
      : el("div", { className: "thumb-fallback" }, (it.album || it.title || "·")[0]);
    const card = el(
      "button",
      { className: "card", onclick: () => openEditor(it.id) },
      thumb,
      el("div", { className: "card__meta" },
        el("span", { className: "card__title" }, it.title || it.id),
        el("span", { className: "card__sub" }, [it.album, it.date].filter(Boolean).join(" · "))
      )
    );
    if (it.featured) card.append(el("span", { className: "badge" }, "★"));
    cards.append(card);
  }
}

// --- editor ----------------------------------------------------------------
// Grow a textarea to fit its content so long fields (highlights, etc.) stay
// legible without manual dragging. Keeps whatever min-height the `rows`
// attribute sets, then expands past it as text is added.
function autoGrow(ta) {
  const fit = () => {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + 2 + "px";
  };
  ta.addEventListener("input", fit);
  // Size once it's laid out (scrollHeight is 0 before it's in the DOM).
  requestAnimationFrame(fit);
}

function fieldRow(field, value) {
  const id = `f-${field.name}`;
  const label = el("label", { htmlFor: id },
    field.name + (field.required ? " *" : ""));
  let input;

  switch (field.type) {
    case "text":
      input = el("textarea", { id, rows: 4, value: value || "" });
      autoGrow(input);
      break;
    case "list":
      input = el("textarea", { id, rows: 4, placeholder: "one entry per line",
        value: Array.isArray(value) ? value.join("\n") : (value || "") });
      input.dataset.list = "1";
      autoGrow(input);
      break;
    case "bool":
      input = el("input", { id, type: "checkbox", checked: !!value });
      break;
    case "int":
      input = el("input", { id, type: "number", value: value ?? "" });
      break;
    case "date":
      input = el("input", { id, type: "date", value: (value || "").slice(0, 10) });
      break;
    case "choice":
      input = el("select", { id });
      for (const c of field.choices) input.append(el("option", { value: c, selected: c === value }, c));
      break;
    case "hidden":
      input = el("input", { id, type: "hidden", value: value || "" });
      return input; // no row
    case "image":
      return imageRow(field, value, id, label);
    case "gallery":
      return galleryRow(field, value, id, label);
    case "video":
      return videoRow(field, value, id, label);
    default:
      input = el("input", { id, type: "text", value: value || "" });
  }
  input.dataset.field = field.name;
  return el("div", { className: "row" }, label, input);
}

function imageRow(field, value, id, label) {
  const preview = el("img", { className: "img-preview" + (value ? "" : " is-empty"),
    src: value ? assetUrl(value) : "", alt: "" });
  const hidden = el("input", { id, type: "hidden", value: value || "" });
  hidden.dataset.field = field.name;
  const fileInput = el("input", { type: "file", accept: "image/*", hidden: true });
  const drop = el("div", { className: "dropzone" },
    el("span", {}, "Drag a photo here or "),
    el("button", { type: "button", className: "link", onclick: () => fileInput.click() }, "browse"),
    el("span", { className: "dz-status" }));

  async function upload(file) {
    if (!file) return;
    const status = $(".dz-status", drop);
    status.textContent = " optimizing…";
    const fd = new FormData();
    fd.append("file", file);
    if (currentKind === "gallery") {
      const albumField = $('[data-field="album"]');
      const album = (albumField && albumField.value.trim()) || "uploads";
      fd.append("album", album);
    } else if (currentKind === "projects" || currentKind === "experiences") {
      const folder = mediaFolder();
      if (!folder) {
        toast("Enter a " + (currentKind === "experiences" ? "company" : "title") + " first", true);
        status.textContent = "";
        return;
      }
      fd.append("folder", folder);
      if (field.name === "video_poster") fd.append("slot", "poster");
    }
    try {
      const res = await fetch(`/api/upload/${currentKind}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      hidden.value = data.image;
      preview.src = assetUrl(data.image) + "?t=" + Date.now();
      preview.classList.remove("is-empty");
      const thumbField = $('[data-field="thumb"]');
      if (thumbField && data.thumb) thumbField.value = data.thumb;
      if (data.suggestedTitle) {
        const t = $('[data-field="title"]');
        if (t && !t.value) t.value = data.suggestedTitle;
      }
      status.textContent = " done ✓";
    } catch (e) {
      status.textContent = "";
      toast("Upload failed: " + e.message, true);
    }
  }

  fileInput.addEventListener("change", () => upload(fileInput.files[0]));
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault(); drop.classList.remove("over");
    upload(e.dataTransfer.files[0]);
  });

  return el("div", { className: "row" }, label, preview, drop, hidden, fileInput);
}

// Multi-image widget (project gallery): each dropped file is optimized into the
// project's folder; the collected [{image, thumb, alt}] list is stored as JSON in
// a hidden field that the server passes straight through to YAML.
function galleryRow(field, value, id, label) {
  const items = Array.isArray(value) ? value.map((x) => Object.assign({}, x)) : [];
  const hidden = el("input", { id, type: "hidden" });
  hidden.dataset.field = field.name;
  const list = el("div", { className: "gallery-items" });
  const fileInput = el("input", { type: "file", accept: "image/*", multiple: true, hidden: true });
  const drop = el("div", { className: "dropzone" },
    el("span", {}, "Drag images here or "),
    el("button", { type: "button", className: "link", onclick: () => fileInput.click() }, "browse"),
    el("span", { className: "dz-status" }));

  const sync = () => { hidden.value = items.length ? JSON.stringify(items) : ""; };
  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    render();
  }
  function render() {
    list.replaceChildren();
    items.forEach((it, i) => {
      const img = el("img", { className: "img-preview", src: assetUrl(it.thumb || it.image), alt: "" });
      const altInput = el("input", { type: "text", value: it.alt || "", placeholder: "alt text (required)" });
      altInput.addEventListener("input", () => { it.alt = altInput.value; sync(); });
      const up = el("button", { type: "button", className: "link", title: "Move up", onclick: () => move(i, -1) }, "↑");
      const down = el("button", { type: "button", className: "link", title: "Move down", onclick: () => move(i, 1) }, "↓");
      const rm = el("button", { type: "button", className: "link", title: "Remove", onclick: () => { items.splice(i, 1); render(); } }, "✕");
      list.append(el("div", { className: "gallery-item" }, img,
        el("div", { className: "gallery-item__body" }, altInput,
          el("div", { className: "gallery-item__tools" }, up, down, rm))));
    });
    sync();
  }

  async function upload(files) {
    const folder = mediaFolder();
    if (!folder) {
      toast("Enter a " + (currentKind === "experiences" ? "company" : "title") + " first", true);
      return;
    }
    const status = $(".dz-status", drop);
    for (const file of files) {
      status.textContent = " optimizing " + file.name + "…";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      fd.append("slot", "gallery");
      try {
        const res = await fetch(`/api/upload/${currentKind}`, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        items.push({ image: data.image, thumb: data.thumb, alt: data.suggestedAlt || "" });
        render();
        status.textContent = " done ✓";
      } catch (e) {
        status.textContent = "";
        toast("Upload failed: " + e.message, true);
      }
    }
  }

  fileInput.addEventListener("change", () => upload([...fileInput.files]));
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault(); drop.classList.remove("over");
    upload([...e.dataTransfer.files]);
  });

  render();
  return el("div", { className: "row" }, label, list, drop, hidden, fileInput);
}

// Self-hosted showcase video: copies the .mp4 into assets/video/projects/<slug>.mp4
// (no transcoding). Stores the path in a hidden field.
function videoRow(field, value, id, label) {
  const hidden = el("input", { id, type: "hidden", value: value || "" });
  hidden.dataset.field = field.name;
  const status = el("span", { className: "dz-status" }, value ? " " + String(value).split("/").pop() : "");
  const fileInput = el("input", { type: "file", accept: "video/mp4", hidden: true });
  const drop = el("div", { className: "dropzone" },
    el("span", {}, "Drop an .mp4 here or "),
    el("button", { type: "button", className: "link", onclick: () => fileInput.click() }, "browse"),
    status);

  async function upload(file) {
    if (!file) return;
    const folder = mediaFolder();
    if (!folder) { toast("Enter a title first", true); return; }
    status.textContent = " uploading…";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    fd.append("slot", "video");
    try {
      const res = await fetch(`/api/upload/${currentKind}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      hidden.value = data.video;
      status.textContent = " " + String(data.video).split("/").pop() + " ✓";
    } catch (e) {
      status.textContent = "";
      toast("Upload failed: " + e.message, true);
    }
  }

  fileInput.addEventListener("change", () => upload(fileInput.files[0]));
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault(); drop.classList.remove("over");
    upload(e.dataTransfer.files[0]);
  });

  return el("div", { className: "row" }, label, drop, hidden, fileInput);
}

async function openEditor(id) {
  currentId = id;
  let meta = {}, body = "";
  if (id) {
    const item = await api("GET", `/api/content/${currentKind}/${id}`);
    meta = item.meta; body = item.body || "";
  }
  const fields = SCHEMA.fields[currentKind];
  const form = el("form", { className: "form", id: "content-form" });

  form.append(el("h2", {}, id ? `Edit ${id}` : `New ${currentKind.slice(0, -1) || currentKind}`));

  for (const f of fields) form.append(fieldRow(f, meta[f.name]));

  // Gallery: the `album` field doubles as the image folder. Offer existing
  // folders as autocomplete suggestions; typing a new name creates a new folder.
  if (currentKind === "gallery") attachAlbumSuggestions(form);

  if (SCHEMA.hasBody[currentKind]) {
    const ta = el("textarea", { id: "body-input", rows: 10, value: body });
    form.append(el("div", { className: "row" }, el("label", { htmlFor: "body-input" }, "body (Markdown)"), ta));
  }

  const actions = el("div", { className: "actions" },
    el("button", { type: "submit", className: "btn btn--primary" }, "Save"));
  if (id) {
    const delBtn = el("button", { type: "button", className: "btn btn--danger" }, "Delete");
    delBtn.onclick = () => doDelete(id);
    actions.append(delBtn);
  }
  form.append(actions);
  form.addEventListener("submit", onSubmit);

  const ed = $("#editor");
  ed.replaceChildren(form);
}

// Attach a <datalist> of existing folders to the gallery `album` input so they
// can be reused; typing a name that isn't listed simply creates a new folder.
async function attachAlbumSuggestions(form) {
  const input = form.querySelector('[data-field="album"]');
  if (!input) return;
  input.setAttribute("placeholder", "e.g. San Francisco");
  await attachAlbumList(input, form);
}

// Shared: fetch the known album names (cached) and wire a <datalist> onto an
// input inside `container`. Used by both the single editor and the bulk form.
async function attachAlbumList(input, container) {
  if (ALBUMS === null) {
    try { ALBUMS = await api("GET", "/api/albums"); }
    catch { ALBUMS = []; }
  }
  const names = [...new Set(ALBUMS.map((a) => a.album).filter(Boolean))];
  if (!names.length || !input.isConnected) return;
  const dl = el("datalist", { id: "album-options" });
  for (const n of names) dl.append(el("option", { value: n }));
  input.setAttribute("list", "album-options");
  if (!container.querySelector("#album-options")) container.append(dl);
}

// --- bulk gallery upload ---------------------------------------------------
// One album, one date, one description — many photos. Each file becomes its own
// gallery item; the title is either the file's own name or a shared stem + index.
function labelRow(text, input) {
  return el("div", { className: "row" }, el("label", {}, text), input);
}

async function openBulk() {
  currentId = null;
  const form = el("form", { className: "form", id: "bulk-form" });
  form.append(el("h2", {}, "Bulk upload"));
  form.append(el("p", { className: "empty" },
    "Drop many photos or scans at once. They share an album, description and date; each becomes its own gallery item."));

  const bucket = el("select", {});
  for (const c of ["photography", "art"]) bucket.append(el("option", { value: c }, c));
  form.append(labelRow("bucket *", bucket));

  const album = el("input", { type: "text", placeholder: "e.g. San Francisco" });
  form.append(labelRow("album *", album));

  const mode = el("select", {});
  mode.append(el("option", { value: "filename" }, "Use each file's name as the title"));
  mode.append(el("option", { value: "index" }, "Shared name + index (1, 2, 3…)"));
  form.append(labelRow("titles", mode));

  const baseTitle = el("input", { type: "text", placeholder: "e.g. Iceland  →  Iceland 1, Iceland 2…" });
  const baseRow = labelRow("base title", baseTitle);
  baseRow.hidden = true;
  mode.addEventListener("change", () => {
    baseRow.hidden = mode.value !== "index";
    if (mode.value === "index") baseTitle.focus();
  });
  form.append(baseRow);

  const alt = el("textarea", { rows: 2, placeholder: "shared description — falls back to each item's title" });
  form.append(labelRow("description (alt)", alt));

  const location = el("input", { type: "text", placeholder: "optional, shared" });
  form.append(labelRow("location", location));

  const date = el("input", { type: "date", value: new Date().toISOString().slice(0, 10) });
  form.append(labelRow("date", date));

  const featured = el("input", { type: "checkbox" });
  form.append(labelRow("featured (all)", featured));

  const files = [];
  const fileList = el("div", { className: "bulk-files" });
  const fileInput = el("input", { type: "file", accept: "image/*", multiple: true, hidden: true });
  const drop = el("div", { className: "dropzone" },
    el("span", {}, "Drag photos here or "),
    el("button", { type: "button", className: "link", onclick: () => fileInput.click() }, "browse"),
    el("span", { className: "dz-status" }));
  const submit = el("button", { type: "submit", className: "btn btn--primary", disabled: true }, "Upload");

  function renderFiles() {
    fileList.replaceChildren();
    files.forEach((f, i) => {
      const rm = el("button", { type: "button", className: "link", title: "Remove",
        onclick: () => { files.splice(i, 1); renderFiles(); } }, "✕");
      fileList.append(el("div", { className: "bulk-file" },
        el("span", { className: "bulk-file__name" }, f.name), rm));
    });
    submit.disabled = !files.length;
    submit.textContent = files.length ? `Upload ${files.length} file${files.length > 1 ? "s" : ""}` : "Upload";
  }
  const addFiles = (list) => { for (const f of list) if (f.type.startsWith("image/")) files.push(f); renderFiles(); };

  fileInput.addEventListener("change", () => addFiles([...fileInput.files]));
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault(); drop.classList.remove("over");
    addFiles([...e.dataTransfer.files]);
  });

  form.append(labelRow("files *", fileList), drop, fileInput,
    el("div", { className: "actions" }, submit));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!album.value.trim()) { toast("Enter an album", true); return; }
    if (!files.length) { toast("Add some files first", true); return; }
    if (mode.value === "index" && !baseTitle.value.trim()) {
      toast("Enter a base title (or switch titles to filenames)", true); return;
    }
    const status = $(".dz-status", drop);
    status.textContent = ` uploading ${files.length}…`;
    submit.disabled = true;
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    fd.append("bucket", bucket.value);
    fd.append("album", album.value.trim());
    fd.append("alt", alt.value.trim());
    fd.append("location", location.value.trim());
    fd.append("date", date.value);
    fd.append("featured", featured.checked ? "1" : "0");
    fd.append("titleMode", mode.value);
    fd.append("baseTitle", baseTitle.value.trim());
    try {
      const res = await fetch("/api/bulk/gallery", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      ALBUMS = null; // a folder may be new
      const failed = data.errors.length ? `, ${data.errors.length} failed` : "";
      toast(`Created ${data.count} item${data.count !== 1 ? "s" : ""}${failed}`, data.errors.length > 0);
      if (data.errors.length) console.warn("Bulk upload errors:", data.errors);
      await loadList();
      openBulk(); // fresh form, ready for the next batch
    } catch (err) {
      status.textContent = "";
      submit.disabled = false;
      toast("Bulk upload failed: " + err.message, true);
    }
  });

  $("#editor").replaceChildren(form);
  attachAlbumList(album, form);
}

function collectMeta() {
  const meta = {};
  for (const input of document.querySelectorAll("[data-field]")) {
    const name = input.dataset.field;
    if (input.type === "checkbox") meta[name] = input.checked;
    else if (input.dataset.list) meta[name] = input.value;
    else meta[name] = input.value;
  }
  return meta;
}

async function onSubmit(e) {
  e.preventDefault();
  const meta = collectMeta();
  const body = $("#body-input") ? $("#body-input").value : "";
  try {
    if (currentId) {
      await api("PUT", `/api/content/${currentKind}/${currentId}`, { meta, body });
      toast("Saved");
    } else {
      const res = await api("POST", `/api/content/${currentKind}`, { meta, body });
      currentId = res.id;
      toast("Created " + res.id);
    }
    if (currentKind === "gallery") ALBUMS = null; // a folder may be new

    await loadList();
    await openEditor(currentId);
  } catch (err) {
    toast(err.message, true);
  }
}

async function doDelete(id) {
  const dropImages = currentKind === "gallery"
    ? confirm("Also delete the image + thumbnail files? (Cancel = keep images)")
    : false;
  if (!confirm(`Delete ${id}?`)) return;
  try {
    await api("DELETE", `/api/content/${currentKind}/${id}?images=${dropImages ? 1 : 0}`);
    currentId = null;
    $("#editor").replaceChildren(el("p", { className: "empty" }, "Deleted."));
    await loadList();
  } catch (err) {
    toast(err.message, true);
  }
}

// --- boot ------------------------------------------------------------------
function selectTab(kind) {
  currentKind = kind;
  currentId = null;
  for (const t of document.querySelectorAll(".tab"))
    t.classList.toggle("is-active", t.dataset.kind === kind);
  $("#bulk-btn").hidden = kind !== "gallery"; // bulk upload is gallery-only
  $("#editor").replaceChildren(el("p", { className: "empty" },
    "Select an item to edit, or press + New."));
  loadList();
}

async function boot() {
  SCHEMA = await api("GET", "/api/schema");
  for (const t of document.querySelectorAll(".tab"))
    t.addEventListener("click", () => selectTab(t.dataset.kind));
  $("#new-btn").addEventListener("click", () => openEditor(null));
  $("#bulk-btn").addEventListener("click", () => openBulk());
  selectTab("gallery");
}

boot().catch((e) => toast("Failed to start: " + e.message, true));
