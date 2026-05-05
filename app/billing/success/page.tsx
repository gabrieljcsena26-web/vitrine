import Link from 'next/link'
import { CheckCircle, ArrowRight, ShieldCheck, Mail, BarChart3 } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-gold/10 flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] border border-stone-200 p-8 text-center shadow-2xl shadow-stone-200/70">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-gold mb-2">Stripe checkout confirmado</p>
        <h1 className="text-3xl sm:text-4xl font-black text-navy mb-3">Pagamento recebido com segurança</h1>
        <p className="text-gray-500 leading-relaxed mb-7 max-w-xl mx-auto">
          O plano está sendo aplicado automaticamente. Você também receberá um email de boas-vindas com o link da página, dashboard e instruções dos relatórios.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <ShieldCheck className="w-5 h-5 text-gold mb-2" />
            <p className="font-black text-navy text-sm">Dados protegidos</p>
            <p className="text-xs text-gray-500 mt-1">Cartão e CVC ficam no Stripe.</p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <Mail className="w-5 h-5 text-gold mb-2" />
            <p className="font-black text-navy text-sm">Email enviado</p>
            <p className="text-xs text-gray-500 mt-1">Resumo e próximos passos.</p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <BarChart3 className="w-5 h-5 text-gold mb-2" />
            <p className="font-black text-navy text-sm">Reports ativos</p>
            <p className="text-xs text-gray-500 mt-1">Conforme o plano escolhido.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-5 py-3 rounded-full font-black hover:bg-yellow-400 transition-colors">
            Criar ou abrir página
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 border border-stone-200 text-navy px-5 py-3 rounded-full font-black hover:border-gold/40 transition-colors">
            Entrar com email e senha
          </Link>
        </div>
      </div>
    </main>
  )
}
