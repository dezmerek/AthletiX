"use client";

export default function CommunicationSection() {
  return (
    <section
      id="communication"
      className="py-20 bg-gradient-to-br from-slate-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Komunikacja
          </span>
          <h2 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Wszystko w jednym miejscu
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">💬</div>
            <h4 className="text-slate-800 font-bold mb-2">Chat</h4>
            <p className="text-slate-600 text-sm">
              Bezpośrednia komunikacja między trenerami a klientami
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📅</div>
            <h4 className="text-slate-800 font-bold mb-2">Kalendarz</h4>
            <p className="text-slate-600 text-sm">
              Planowanie zajęć i terminów konsultacji
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📝</div>
            <h4 className="text-slate-800 font-bold mb-2">Notatki</h4>
            <p className="text-slate-600 text-sm">
              Notatki i komentarze do postępów klientów
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-slate-800 font-bold mb-2">Raporty</h4>
            <p className="text-slate-600 text-sm">
              Regularne podsumowania postępów
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
