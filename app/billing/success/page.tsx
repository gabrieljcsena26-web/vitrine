import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-xl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-5" />
        <h1 className="text-3xl font-black text-navy mb-3">Pagamento recebido</h1>
        <p className="text-gray-500 leading-relaxed mb-7">
          O Stripe confirmou o checkout. Se você já criou uma página com este email, o plano será atualizado automaticamente pelo webhook.
        </p>
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
