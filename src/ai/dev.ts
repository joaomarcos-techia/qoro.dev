
'use server';
// Flows will be imported for their side effects in this file.
import './flows/user-management';
import './flows/crm-management';
import './flows/task-management';
import './flows/pulse-flow';
import './flows/finance-management';
import './flows/supplier-management';
import './flows/reconciliation-flow';

// O fluxo de cobrança foi removido para permitir o teste sem credenciais do Stripe.
// As ferramentas foram removidas conforme solicitação do usuário.
