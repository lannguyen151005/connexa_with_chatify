"use client";

import React from "react"; import { Privacy } from "../types/Post";

interface Props { privacy: Privacy; onChange: (privacy: Privacy) => void; disabled: boolean; }

const privacyOptions = [ { value: "PUBLIC", label: "Công khai", description: "Mọi người đều có thể xem", icon: "fas fa-globe-asia", }, { value: "FRIENDS", label: "Bạn bè", description: "Chỉ bạn bè có thể xem", icon: "fas fa-user-friends", }, { value: "PRIVATE", label: "Chỉ mình tôi", description: "Chỉ bạn có thể xem", icon: "fas fa-lock", }, ] as const;

export default function PostPrivacySelect({ privacy, onChange, disabled, }: Props) { const selected = privacyOptions.find((option) => option.value === privacy) ?? privacyOptions[0];

return ( <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm ring-1 ring-slate-100"> <i className={`${selected.icon} text-sm`} /> </div>

  <div className="min-w-0 flex-1 pt-3">
    <label
      htmlFor="post-privacy"
      className="block text-xs font-semibold text-slate-700"
    >
      Ai có thể xem bài viết?
    </label>

    <p className="mt-1 text-[11px] text-slate-400">
      {selected.description}
    </p>
  </div>

  <select
    id="post-privacy"
    value={privacy}
    onChange={(event) =>
      onChange(event.target.value as Privacy)
    }
    disabled={disabled}
    className="max-w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition hover:border-sky-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {privacyOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>


); }