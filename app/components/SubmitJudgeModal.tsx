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

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-semibold" style={{ color: "#7d8590" }}>
      {children}
      {required && <span style={{ color: "#f85149" }}> *</span>}
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
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
      style={{
        backgroundColor: "#0d1117",
        borderColor: "#30363d",
        color: "#e6edf3",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#74ACDF")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
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
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
      style={{
        backgroundColor: "#0d1117",
        borderColor: "#30363d",
        color: value ? "#e6edf3" : "#7d8590",
      }}
    >
      <option value="" disabled>
        {placeholder ?? "Seleccionar..."}
      </option>
      {options.map((o) => (
        <option key={o} value={o} style={{ color: "#e6edf3" }}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold" style={{ color: "#e6edf3" }}>
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative my-4 w-full max-w-2xl rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #21262d" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "#e6edf3" }}>
              Cargar información de juez
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: "#7d8590" }}>
              Todos los campos marcados con <span style={{ color: "#f85149" }}>*</span> son
              obligatorios
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#7d8590" }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          // ── Estado de éxito ──
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: "#3fb95020", border: "2px solid #3fb950" }}
            >
              ✓
            </div>
            <h3 className="text-lg font-bold" style={{ color: "#3fb950" }}>
              Informe recibido
            </h3>
            <p className="text-sm" style={{ color: "#7d8590" }}>
              El informe fue registrado bajo el número de confirmación:
            </p>
            <span
              className="rounded-lg px-4 py-2 font-mono text-sm font-bold"
              style={{
                backgroundColor: "#0d1117",
                color: "#74ACDF",
                border: "1px solid #74ACDF40",
              }}
            >
              {confirmationId}
            </span>
            <div
              className="mt-2 w-full rounded-lg p-4 text-left text-xs"
              style={{ backgroundColor: "#0d1117", border: "1px solid #21262d" }}
            >
              <p style={{ color: "#7d8590" }}>Responsable del informe:</p>
              <p className="mt-1 font-semibold" style={{ color: "#e6edf3" }}>
                {currentUser.nombre} — {currentUser.email}
              </p>
              <p className="mt-1" style={{ color: "#7d8590" }}>
                Registrado el {submitTimestamp}
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "#7d8590" }}>
              Este registro queda asociado a tu identidad. Cualquier dato falso o tendencioso puede
              generar responsabilidad civil y penal.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#74ACDF", color: "#0d1117" }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#21262d" }}>
            {/* ── 1. Responsable del informe (locked) ── */}
            <section className="px-6 py-5">
              <SectionTitle>
                <span
                  className="rounded px-1.5 py-0.5 text-xs"
                  style={{
                    backgroundColor: "#3fb95020",
                    color: "#3fb950",
                    border: "1px solid #3fb95040",
                  }}
                >
                  Sesión activa
                </span>
                Responsable del informe
              </SectionTitle>
              <div
                className="flex items-center gap-4 rounded-xl p-4"
                style={{ backgroundColor: "#0d1117", border: "1px solid #21262d" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: "#74ACDF20",
                    color: "#74ACDF",
                    border: "1px solid #74ACDF40",
                  }}
                >
                  AE
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#e6edf3" }}>
                    {currentUser.nombre}
                  </p>
                  <p className="text-xs" style={{ color: "#7d8590" }}>
                    {currentUser.email} · ID: {currentUser.id}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-xs"
                  style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                >
                  Solo lectura
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "#7d8590" }}>
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
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-normal"
                    style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                  >
                    {form.casos.length}
                  </span>
                </SectionTitle>
                <button
                  onClick={addCaso}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ borderColor: "#74ACDF40", color: "#74ACDF" }}
                >
                  + Agregar caso
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {form.casos.map((caso, idx) => (
                  <div
                    key={caso.id}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "#0d1117", border: "1px solid #21262d" }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: "#7d8590" }}>
                        Caso #{idx + 1}
                      </span>
                      {form.casos.length > 1 && (
                        <button
                          onClick={() => removeCaso(caso.id)}
                          className="text-xs transition-colors hover:text-red-400"
                          style={{ color: "#7d8590" }}
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
                className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors"
                style={{
                  borderColor: dragging ? "#74ACDF" : "#30363d",
                  backgroundColor: dragging ? "#74ACDF08" : "transparent",
                }}
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
                  className="h-8 w-8"
                  style={{ color: "#7d8590" }}
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
                <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>
                  Arrastrá o hacé clic para subir PDFs
                </p>
                <p className="text-xs" style={{ color: "#7d8590" }}>
                  Solo archivos .pdf · Podés subir varios
                </p>
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
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ backgroundColor: "#0d1117", border: "1px solid #21262d" }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span style={{ color: "#f85149" }}>📄</span>
                        <span className="truncate text-xs font-medium" style={{ color: "#e6edf3" }}>
                          {f.name}
                        </span>
                        <span className="shrink-0 text-xs" style={{ color: "#7d8590" }}>
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(f.name)}
                        className="shrink-0 ml-2 text-xs hover:text-red-400"
                        style={{ color: "#7d8590" }}
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
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                style={{
                  backgroundColor: "#0d1117",
                  borderColor: "#30363d",
                  color: "#e6edf3",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#74ACDF")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
              />
            </section>

            {/* ── Footer ── */}
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#7d8590", maxWidth: "340px" }}
              >
                Al enviar confirmás que los datos son verídicos. La carga queda vinculada a{" "}
                <strong style={{ color: "#e6edf3" }}>{currentUser.nombre}</strong> (
                {currentUser.email}) con responsabilidad civil.
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ borderColor: "#30363d", color: "#7d8590" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!valid}
                  className="rounded-lg px-5 py-2 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: valid ? "#74ACDF" : "#21262d",
                    color: valid ? "#0d1117" : "#4d5561",
                    cursor: valid ? "pointer" : "not-allowed",
                  }}
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
