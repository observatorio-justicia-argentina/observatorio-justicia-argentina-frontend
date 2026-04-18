"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";

// ── Provincias / jurisdicciones argentinas ───────────────────────────────────

const PROVINCIAS = [
  "CABA",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const TIPOS_MEDIDA = [
  "Libertad cautelar",
  "Excarcelación",
  "Prisión domiciliaria",
  "Libertad condicional",
  "Otra medida cautelar",
];

const RESULTADOS = [
  "No comparecencia (FTA)",
  "Nuevo arresto",
  "Revocación de la medida",
  "Pendiente / En curso",
];

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Caso {
  id: string;
  nroExpediente: string;
  fechaResolucion: string;
  tipoMedida: string;
  resultado: string;
}

interface FormData {
  nombreJuez: string;
  domicilioTribunal: string;
  domicilioCalle: string;
  provincia: string;
  deptoJudicial: string;
  casos: Caso[];
  archivos: File[];
  observaciones: string;
}

function emptyCase(): Caso {
  return {
    id: Math.random().toString(36).slice(2),
    nroExpediente: "",
    fechaResolucion: "",
    tipoMedida: "",
    resultado: "",
  };
}

function isFormValid(f: FormData): boolean {
  if (!f.nombreJuez.trim()) return false;
  if (!f.domicilioTribunal.trim()) return false;
  if (!f.domicilioCalle.trim()) return false;
  if (!f.provincia) return false;
  if (!f.deptoJudicial.trim()) return false;
  if (f.archivos.length === 0) return false;
  if (f.casos.length === 0) return false;
  for (const c of f.casos) {
    if (!c.nroExpediente.trim() || !c.fechaResolucion || !c.tipoMedida || !c.resultado)
      return false;
  }
  return true;
}

// ── Componentes auxiliares ───────────────────────────────────────────────────

const INPUT_CLASSES =
  "bg-ink border-border-strong text-cream focus:border-gold w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:outline-none placeholder:text-cream-muted";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-cream-muted mb-1 block text-xs font-semibold">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASSES}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT_CLASSES} ${value ? "text-cream" : "text-cream-muted"}`}
    >
      <option value="" disabled>
        {placeholder ?? "Seleccionar..."}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="text-cream">
          {o}
        </option>
      ))}
    </select>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-cream mb-3 flex items-center gap-2 font-serif text-base font-bold">
      {children}
    </h3>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────

interface SubmitJudgeModalProps {
  onClose: () => void;
}

export default function SubmitJudgeModal({ onClose }: SubmitJudgeModalProps) {
  const { user } = useAuth();
  const currentUser = user
    ? { nombre: user.nombre, email: user.email, id: user.id }
    : { nombre: "—", email: "—", id: "—" };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState<FormData>({
    nombreJuez: "",
    domicilioTribunal: "",
    domicilioCalle: "",
    provincia: "",
    deptoJudicial: "",
    casos: [emptyCase()],
    archivos: [],
    observaciones: "",
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Casos
  const updateCaso = (id: string, field: keyof Caso, value: string) =>
    set(
      "casos",
      form.casos.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  const addCaso = () => set("casos", [...form.casos, emptyCase()]);

  const removeCaso = (id: string) =>
    set(
      "casos",
      form.casos.filter((c) => c.id !== id),
    );

  // Archivos
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter((f) => f.type === "application/pdf");
    set("archivos", [...form.archivos, ...pdfs]);
  };

  const removeFile = (name: string) =>
    set(
      "archivos",
      form.archivos.filter((f) => f.name !== name),
    );

  // Submit
  const handleSubmit = () => {
    if (!isFormValid(form)) return;
    const id = "INF-" + Date.now().toString(36).toUpperCase();
    setConfirmationId(id);
    setSubmitted(true);
  };

  const valid = isFormValid(form);
  const submitTimestamp = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const submitBtnCls = valid
    ? "bg-gold text-cream hover:bg-gold-strong cursor-pointer"
    : "bg-border text-cream-subtle cursor-not-allowed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ink-elevated border-border relative my-4 w-full max-w-2xl rounded-2xl border shadow-2xl">
        {/* ── Header ── */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-cream font-serif text-lg font-bold">Cargar información de juez</h2>
            <p className="text-cream-muted mt-0.5 text-xs">
              Todos los campos marcados con <span className="text-danger">*</span> son obligatorios
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream-muted hover:bg-cream/5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          // ── Estado de éxito ──
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="bg-success-soft border-success flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl">
              ✓
            </div>
            <h3 className="text-success font-serif text-lg font-bold">Informe recibido</h3>
            <p className="text-cream-muted text-sm">
              El informe fue registrado bajo el número de confirmación:
            </p>
            <span className="bg-ink text-gold border-gold/40 rounded-lg border px-4 py-2 font-mono text-sm font-bold">
              {confirmationId}
            </span>
            <div className="bg-ink border-border mt-2 w-full rounded-lg border p-4 text-left text-xs">
              <p className="text-cream-muted">Responsable del informe:</p>
              <p className="text-cream mt-1 font-semibold">
                {currentUser.nombre} — {currentUser.email}
              </p>
              <p className="text-cream-muted mt-1">Registrado el {submitTimestamp}</p>
            </div>
            <p className="text-cream-muted mt-2 text-xs leading-relaxed">
              Este registro queda asociado a tu identidad. Cualquier dato falso o tendencioso puede
              generar responsabilidad civil y penal.
            </p>
            <button
              onClick={onClose}
              className="bg-gold text-cream hover:bg-gold-strong mt-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {/* ── 1. Responsable del informe (locked) ── */}
            <section className="px-6 py-5">
              <SectionTitle>
                <span className="bg-success-soft text-success border-success/40 rounded border px-1.5 py-0.5 text-xs font-normal">
                  Sesión activa
                </span>
                Responsable del informe
              </SectionTitle>
              <div className="bg-ink border-border flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-gold-soft text-gold border-gold/40 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
                  AE
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-cream text-sm font-semibold">{currentUser.nombre}</p>
                  <p className="text-cream-muted text-xs">
                    {currentUser.email} · ID: {currentUser.id}
                  </p>
                </div>
                <span className="bg-border text-cream-muted shrink-0 rounded px-2 py-0.5 text-xs">
                  Solo lectura
                </span>
              </div>
              <p className="text-cream-muted mt-2 text-xs leading-relaxed">
                Al enviar este informe asumís responsabilidad civil por la veracidad de los datos.
                Tu identidad queda registrada junto al informe.
              </p>
            </section>

            {/* ── 2. Datos del juez ── */}
            <section className="px-6 py-5">
              <SectionTitle>Datos del juez</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label required>Nombre y apellido completo</Label>
                  <Input
                    value={form.nombreJuez}
                    onChange={(v) => set("nombreJuez", v)}
                    placeholder="Ej: Dr. Juan García Pérez"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label required>Tribunal / Juzgado</Label>
                  <Input
                    value={form.domicilioTribunal}
                    onChange={(v) => set("domicilioTribunal", v)}
                    placeholder="Ej: Tribunal Oral en lo Criminal N° 5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label required>Domicilio laboral (calle y número)</Label>
                  <Input
                    value={form.domicilioCalle}
                    onChange={(v) => set("domicilioCalle", v)}
                    placeholder="Ej: Av. Comodoro Py 2002, CABA"
                  />
                </div>
                <div>
                  <Label required>Provincia / Jurisdicción</Label>
                  <Select
                    value={form.provincia}
                    onChange={(v) => set("provincia", v)}
                    options={PROVINCIAS}
                    placeholder="Seleccioná la provincia"
                  />
                </div>
                <div>
                  <Label required>Departamento Judicial</Label>
                  <Input
                    value={form.deptoJudicial}
                    onChange={(v) => set("deptoJudicial", v)}
                    placeholder="Ej: Depto. Judicial La Matanza"
                  />
                </div>
              </div>
            </section>

            {/* ── 3. Casos ── */}
            <section className="px-6 py-5">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle>
                  Casos
                  <span className="bg-border text-cream-muted rounded-full px-2 py-0.5 text-xs font-normal">
                    {form.casos.length}
                  </span>
                </SectionTitle>
                <button
                  onClick={addCaso}
                  className="border-gold/40 text-gold hover:bg-gold-soft flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  + Agregar caso
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {form.casos.map((caso, idx) => (
                  <div key={caso.id} className="bg-ink border-border rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-cream-muted text-xs font-semibold">
                        Caso #{idx + 1}
                      </span>
                      {form.casos.length > 1 && (
                        <button
                          onClick={() => removeCaso(caso.id)}
                          className="text-cream-muted hover:text-danger text-xs transition-colors"
                          aria-label="Eliminar caso"
                        >
                          ✕ Eliminar
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label required>N° de expediente</Label>
                        <Input
                          value={caso.nroExpediente}
                          onChange={(v) => updateCaso(caso.id, "nroExpediente", v)}
                          placeholder="Ej: 12345/2024"
                        />
                      </div>
                      <div>
                        <Label required>Fecha de resolución</Label>
                        <Input
                          type="date"
                          value={caso.fechaResolucion}
                          onChange={(v) => updateCaso(caso.id, "fechaResolucion", v)}
                        />
                      </div>
                      <div>
                        <Label required>Tipo de medida</Label>
                        <Select
                          value={caso.tipoMedida}
                          onChange={(v) => updateCaso(caso.id, "tipoMedida", v)}
                          options={TIPOS_MEDIDA}
                          placeholder="Tipo de medida..."
                        />
                      </div>
                      <div>
                        <Label required>Resultado</Label>
                        <Select
                          value={caso.resultado}
                          onChange={(v) => updateCaso(caso.id, "resultado", v)}
                          options={RESULTADOS}
                          placeholder="Resultado del caso..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 4. Documentación adjunta ── */}
            <section className="px-6 py-5">
              <SectionTitle>Documentación adjunta</SectionTitle>

              {/* Drop zone */}
              <div
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors ${
                  dragging ? "border-gold bg-gold-soft" : "border-border-strong"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <svg
                  className="text-cream-muted h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32A4.5 4.5 0 0 1 17.25 19.5H6.75Z"
                  />
                </svg>
                <p className="text-cream text-sm font-medium">
                  Arrastrá o hacé clic para subir PDFs
                </p>
                <p className="text-cream-muted text-xs">Solo archivos .pdf · Podés subir varios</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {form.archivos.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {form.archivos.map((f) => (
                    <li
                      key={f.name}
                      className="bg-ink border-border flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-danger">📄</span>
                        <span className="text-cream truncate text-xs font-medium">{f.name}</span>
                        <span className="text-cream-muted shrink-0 text-xs">
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(f.name)}
                        className="text-cream-muted hover:text-danger ml-2 shrink-0 text-xs"
                        aria-label="Quitar archivo"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ── 5. Observaciones opcionales ── */}
            <section className="px-6 py-5">
              <Label>Observaciones adicionales (opcional)</Label>
              <textarea
                value={form.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
                rows={3}
                placeholder="Contexto adicional, fuentes, aclaraciones..."
                className={`${INPUT_CLASSES} resize-none`}
              />
            </section>

            {/* ── Footer ── */}
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-cream-muted max-w-[340px] text-xs leading-relaxed">
                Al enviar confirmás que los datos son verídicos. La carga queda vinculada a{" "}
                <strong className="text-cream">{currentUser.nombre}</strong> ({currentUser.email})
                con responsabilidad civil.
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={onClose}
                  className="border-border-strong text-cream-muted hover:bg-cream/5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!valid}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${submitBtnCls}`}
                >
                  Enviar informe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
