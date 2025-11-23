import React from "react";
import type { SessionData } from "../types";

interface SidebarProps {
  session: SessionData;
  onSelectStudent: (id: string) => void;
  onAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
}

export function Sidebar({
  session,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent
}: SidebarProps) {
  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Teacher Summary (Read-Only) */}
      <div className="p-6 border-b border-gray-200 bg-blue-50/50">
        <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-4">Session Enseignant</h2>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Enseignant</div>
            <div className="font-medium text-gray-900 truncate" title={session.teacher.nom}>
              {session.teacher.nom || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">École</div>
            <div className="font-medium text-gray-900 truncate" title={session.teacher.ecole}>
              {session.teacher.ecole || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Classe</div>
            <div className="font-medium text-gray-900 truncate" title={session.teacher.classe}>
              {session.teacher.classe || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Demandes ({session.students.length})</h2>
          <button
            onClick={onAddStudent}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
            title="Ajouter un élève"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {session.students.map((student) => {
            const isActive = student.id === session.currentStudentId;
            // Compute display name
            const displayName = (student.eleve?.prenom || student.eleve?.nom)
              ? `${student.eleve.prenom} ${student.eleve.nom}`.trim()
              : student.name;

            return (
              <div
                key={student.id}
                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all
                  ${isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"}
                `}
                onClick={() => onSelectStudent(student.id)}
              >
                <div className="truncate font-medium text-sm">
                  {displayName}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStudent(student.id);
                  }}
                  className={`
                    opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 transition-opacity
                    ${isActive ? "text-white" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}
                  `}
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 text-xs text-center text-gray-400">
        Session v{session.meta.version}
      </div>
    </aside>
  );
}
