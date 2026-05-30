"use client";
// ============================================================
// Admin CMS Page — Project Submission Form with Zod & React Hook Form
// ============================================================
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, FolderOpen, Rocket, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

// Form Validation Schema using Zod
const projectFormSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters").max(30, "ID too long"),
  userId: z.enum(["user-1", "user-2", "user-team"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  hasIframe: z.boolean(),
  projectUrl: z.string().url("Must be a valid URL (e.g. https://github.com/...)"),
  liveApiEndpoint: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  tags: z.string().min(2, "Add at least one tag (comma-separated, e.g. React, D1)"),
  image: z
    .any()
    .refine((files) => !files || files.length === 0 || files[0] instanceof File, "Upload a valid image file")
    .optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function AdminPage() {
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      id: `proj-${Math.random().toString(36).substring(2, 8)}`,
      userId: "user-team",
      title: "",
      description: "",
      hasIframe: false,
      projectUrl: "",
      liveApiEndpoint: "",
      tags: "",
    },
  });

  const hasIframeValue = watch("hasIframe");

  const onSubmit = async (data: ProjectFormValues) => {
    setStatus({ type: "loading", message: "Uploading assets to R2 and writing SQL records to D1..." });
    try {
      const formData = new FormData();
      formData.append("id", data.id);
      formData.append("userId", data.userId);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("hasIframe", data.hasIframe ? "1" : "0");
      formData.append("projectUrl", data.projectUrl);
      if (data.liveApiEndpoint) {
        formData.append("liveApiEndpoint", data.liveApiEndpoint);
      }

      // Convert comma-separated tags to JSON Array string
      const parsedTags = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      formData.append("tags", JSON.stringify(parsedTags));

      // Append multipart file buffer for R2 upload if uploaded
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to submit project data");
      }

      setStatus({
        type: "success",
        message: `Project "${data.title}" successfully written to D1 database! R2 asset generated.`,
      });
      reset({
        id: `proj-${Math.random().toString(36).substring(2, 8)}`,
        userId: "user-team",
        title: "",
        description: "",
        hasIframe: false,
        projectUrl: "",
        liveApiEndpoint: "",
        tags: "",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "An unexpected error occurred during database migration.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] text-zinc-100 flex flex-col font-sans select-none overflow-y-auto">
      
      {/* Top Navbar */}
      <nav className="w-full h-16 border-b border-zinc-800/60 bg-[#08090a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit to OS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Web OS Admin Portal
          </span>
        </div>
        <div className="w-20" />
      </nav>

      {/* Form Container */}
      <main className="flex-1 w-full max-w-[720px] mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Deploy New Project
          </h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Write static structures and metadata directly into Cloudflare D1 Serverless SQL database and stream graphic banners directly to Cloudflare R2 object buckets.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Status Message Area */}
          <AnimatePresence>
            {status.type !== "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm font-medium ${
                  status.type === "loading"
                    ? "bg-zinc-800/40 border-zinc-700/60 text-zinc-300"
                    : status.type === "success"
                    ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-400"
                    : "bg-rose-950/20 border-rose-800/40 text-rose-400"
                }`}
              >
                {status.type === "loading" && <Loader2 className="w-5 h-5 animate-spin text-zinc-400 shrink-0 mt-0.5" />}
                {status.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                {status.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                <span>{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Project ID & Developer Select Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project System ID</label>
                <input
                  type="text"
                  {...register("id")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  placeholder="proj-identifier"
                />
                {errors.id && <span className="text-xs text-rose-400 font-semibold">{errors.id.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Owner (User ID)</label>
                <select
                  {...register("userId")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="user-1">Mohammed (Backend Engineer)</option>
                  <option value="user-2">Moamen (UI/UX & Creative)</option>
                  <option value="user-team">Full-Stack Team (Shared)</option>
                </select>
                {errors.userId && <span className="text-xs text-rose-400 font-semibold">{errors.userId.message}</span>}
              </div>
            </div>

            {/* Title & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Name (Title)</label>
                <input
                  type="text"
                  {...register("title")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  placeholder="e.g. GuildMarket"
                />
                {errors.title && <span className="text-xs text-rose-400 font-semibold">{errors.title.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tech Stack Tags</label>
                <input
                  type="text"
                  {...register("tags")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  placeholder="React, Next.js, Cloudflare D1"
                />
                {errors.tags && <span className="text-xs text-rose-400 font-semibold">{errors.tags.message}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Markdown Description</label>
              <textarea
                rows={4}
                {...register("description")}
                className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors font-mono resize-y"
                placeholder="## Product Specification&#10;&#10;- **Backend:** Node.js + D1&#10;- **Storage:** R2 bucket"
              />
              {errors.description && <span className="text-xs text-rose-400 font-semibold">{errors.description.message}</span>}
            </div>

            {/* URL Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project URL</label>
                <input
                  type="text"
                  {...register("projectUrl")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  placeholder="https://github.com/..."
                />
                {errors.projectUrl && <span className="text-xs text-rose-400 font-semibold">{errors.projectUrl.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live API Endpoint (Optional)</label>
                <input
                  type="text"
                  {...register("liveApiEndpoint")}
                  className="bg-black/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  placeholder="https://api.domain.com/health"
                />
                {errors.liveApiEndpoint && <span className="text-xs text-rose-400 font-semibold">{errors.liveApiEndpoint.message}</span>}
              </div>
            </div>

            {/* Graphic Banner & Iframe Render Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Graphic Banner (R2 Storage)</label>
                <div className="relative w-full h-12 bg-black/50 border border-zinc-800 rounded-xl flex items-center px-4 hover:border-zinc-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      if (e.target.files) {
                        setValue("image", e.target.files);
                      }
                    }}
                  />
                  <span className="text-xs text-zinc-400 font-medium truncate">
                    {watch("image") && watch("image").length > 0
                      ? `Selected: ${watch("image")[0].name}`
                      : "Choose file banner..."}
                  </span>
                </div>
                {errors.image && <span className="text-xs text-rose-400 font-semibold">{errors.image.message as string}</span>}
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 border border-zinc-800/60 rounded-xl h-12">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-300">Sandbox Preview Overlay</span>
                  <span className="text-[10px] text-zinc-500">Allow iframe mount inside dynamic file managers</span>
                </div>
                <input
                  type="checkbox"
                  {...register("hasIframe")}
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 accent-indigo-500 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] transition-all"
            >
              {status.type === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying Assets & Metadata...</span>
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  <span>Execute Production Deploy</span>
                </>
              )}
            </button>

          </form>
        </motion.div>
      </main>
    </div>
  );
}
