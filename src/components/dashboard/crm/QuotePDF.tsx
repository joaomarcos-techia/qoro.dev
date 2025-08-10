
'use client';
import { QuoteProfile } from '@/ai/schemas';
import React from 'react';

interface QuotePDFProps {
    quote: QuoteProfile;
}

export const QuotePDF = React.forwardRef<HTMLDivElement, QuotePDFProps>(({ quote }, ref) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    }

    return (
        <div ref={ref} className="bg-white p-0">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                .pdf-container { font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.5; color: #333; background-color: #fff; width: 210mm; min-height: 297mm; padding: 15mm; }
                .pdf-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .pdf-header .logo h1 { font-size: 2rem; font-weight: 700; color: #111; margin: 0; }
                .pdf-header .logo p { font-size: 0.8rem; color: #666; margin: 0; }
                .pdf-header .quote-details { text-align: right; }
                .pdf-header .quote-details h2 { font-size: 1.5rem; color: #8B5CF6; margin: 0 0 0.25rem 0; }
                .pdf-header .quote-details p { margin: 0; color: #555; }
                .customer-info { margin-bottom: 1.5rem; padding: 1rem; background-color: #f9fafb; border-radius: 8px; border: 1px solid #eee; }
                .customer-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #111; }
                .customer-info p { margin: 0; color: #444; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
                .items-table th, .items-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
                .items-table th { background-color: #8B5CF6; color: white; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
                .items-table .item-name { font-weight: 600; }
                .items-table .align-right { text-align: right; }
                .items-table .align-center { text-align: center; }
                .totals-section { display: flex; justify-content: flex-end; }
                .totals-table { width: 45%; }
                .totals-table td { padding: 0.5rem 1rem; }
                .totals-table .label { text-align: right; font-weight: 600; color: #555; }
                .totals-table .value { text-align: right; }
                .totals-table .grand-total { font-size: 1.25rem; font-weight: 700; background-color: #f3f4f6; }
                .grand-total .label, .grand-total .value { color: #8B5CF6; }
                .notes-section { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; }
                .notes-section h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; }
                .notes-section p { white-space: pre-wrap; font-size: 0.8rem; color: #555; }
                .pdf-footer { position: absolute; bottom: 15mm; left: 15mm; right: 15mm; text-align: center; font-size: 0.75rem; color: #aaa; border-top: 1px solid #eee; padding-top: 0.5rem; }
            `}</style>
            <div className="pdf-container">
                <header className="pdf-header">
                    <div className="logo">
                        <h1>Sua Empresa</h1>
                        <p>Seu Slogan ou Endereço</p>
                    </div>
                    <div className="quote-details">
                        <h2>Orçamento</h2>
                        <p><strong>Número:</strong> {quote.number}</p>
                        <p><strong>Data:</strong> {formatDate(quote.createdAt)}</p>
                        <p><strong>Válido até:</strong> {formatDate(quote.validUntil)}</p>
                    </div>
                </header>
                <section className="customer-info">
                    <h3>Para:</h3>
                    <p><strong>{quote.customerName}</strong></p>
                    {/* Add more customer details if available */}
                </section>
                <section>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th className="item-name">Descrição do Item</th>
                                <th className="align-center">Qtd.</th>
                                <th className="align-right">Preço Unit.</th>
                                <th className="align-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quote.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="item-name">{item.name}</td>
                                    <td className="align-center">{item.quantity}</td>
                                    <td className="align-right">{formatCurrency(item.unitPrice)}</td>
                                    <td className="align-right">{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className="totals-section">
                     <table className="totals-table">
                        <tbody>
                            <tr>
                                <td className="label">Subtotal:</td>
                                <td className="value">{formatCurrency(quote.subtotal)}</td>
                            </tr>
                             <tr>
                                <td className="label">Desconto:</td>
                                <td className="value">{formatCurrency(quote.discount || 0)}</td>
                            </tr>
                             <tr>
                                <td className="label">Impostos:</td>
                                <td className="value">{formatCurrency(quote.tax || 0)}</td>
                            </tr>
                            <tr className="grand-total">
                                <td className="label">TOTAL:</td>
                                <td className="value">{formatCurrency(quote.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                {quote.notes && (
                    <section className="notes-section">
                        <h4>Observações e Termos:</h4>
                        <p>{quote.notes}</p>
                    </section>
                )}
                <footer className="pdf-footer">
                    Obrigado pela sua preferência! | contato@suaempresa.com
                </footer>
            </div>
        </div>
    );
});

QuotePDF.displayName = 'QuotePDF';
