import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-2">
      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{children}</div>
    </section>
  )
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 mb-8">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Conditions générales & Confidentialité</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">nreservi.online — Dernière mise à jour : février 2026</p>

        <div className="mt-8 space-y-8">
          <Section title="1. Éditeur de la plateforme">
            <p>
              nreservi.online est une plateforme algérienne de gestion et de réservation de tables de restaurant en ligne,
              éditée et exploitée en Algérie. Pour toute question relative aux présentes conditions, contactez-nous via
              l'adresse de contact publiée sur notre page de présentation.
            </p>
          </Section>

          <Section title="2. Objet">
            <p>
              Les présentes conditions générales encadrent l'utilisation de la plateforme nreservi.online par :
              (i) les clients souhaitant réserver une table dans un établissement partenaire ;
              (ii) les restaurants et leur personnel gérant leurs réservations via l'espace professionnel.
              Toute utilisation de la plateforme implique l'acceptation pleine et entière des présentes conditions.
            </p>
          </Section>

          <Section title="3. Description du service">
            <p>
              La plateforme permet aux clients de consulter la disponibilité des tables en temps réel, d'effectuer une
              réservation en ligne et de recevoir une confirmation par WhatsApp. Elle permet aux établissements partenaires
              de gérer leurs réservations, leur menu, leurs espaces et la communication avec leurs clients.
              La plateforme n'est pas partie au contrat de restauration conclu entre le client et l'établissement.
            </p>
          </Section>

          <Section id="donnees-personnelles" title="4. Protection des données personnelles — Loi n° 18-07">
            <p>
              Le traitement des données personnelles réalisé via nreservi.online est effectué conformément à la
              <strong> loi algérienne n° 18-07 du 10 juin 2018</strong> relative à la protection des personnes physiques
              dans le traitement des données à caractère personnel, et à ses textes d'application.
            </p>
            <p>
              <strong>Données collectées :</strong> pour les clients — nom, numéro de téléphone (WhatsApp), contenu des
              réservations et demandes éventuelles ; pour les restaurants — identité du propriétaire, coordonnées
              (e-mail, téléphone, WhatsApp), informations de l'établissement (adresse, menu, horaires, photos) et
              paramètres de gestion.
            </p>
            <p>
              <strong>Finalités :</strong> gestion des réservations, communication des réservations aux établissements,
              confirmations et rappels par WhatsApp, notifications relatives aux abonnements, et amélioration du service.
            </p>
            <p>
              <strong>Conservation :</strong> les données sont conservées pendant la durée de la relation commerciale
              et archivées ensuite selon les durées légales applicables.
            </p>
            <p>
              <strong>Droits des personnes :</strong> conformément à la loi 18-07, toute personne dispose d'un droit
              d'accès, de rectification et d'opposition sur ses données personnelles. Pour exercer ces droits, contactez
              l'administration de la plateforme via l'adresse de contact publiée sur la page de présentation.
              Les titulaires de restaurants peuvent exercer ces droits directement depuis leur espace professionnel.
            </p>
            <p>
              <strong>Autorité de contrôle :</strong> l'Autorité nationale de protection des données à caractère
              personnel (ANPDP) est compétente pour toute réclamation relative au traitement des données personnelles.
            </p>
            <p>
              <strong>Sécurité :</strong> la plateforme met en œuvre des mesures techniques et organisationnelles
              appropriées (chiffrement des communications, contrôle d'accès, journalisation) pour protéger les données
              contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisés.
            </p>
          </Section>

          <Section title="5. Comptes et responsabilités">
            <p>
              Le propriétaire d'un restaurant est responsable de l'exactitude des informations publiées sur sa page
              (menu, horaires, photos) et de la gestion des réservations reçues. Il est également responsable du
              traitement des données de ses propres clients qu'il consulte via la plateforme, conformément à la loi 18-07.
            </p>
            <p>
              Le client s'engage à fournir des informations exactes et à honorer ses réservations. Les réservations
              non honorées répétées peuvent conduire à un refus de service par l'établissement.
            </p>
          </Section>

          <Section title="6. Abonnements des restaurants">
            <p>
              L'accès à l'espace professionnel est soumis à un abonnement (formule Basique ou Premium) d'une durée
              déterminée. À l'expiration de l'abonnement, l'accès aux fonctionnalités professionnelles est suspendu ;
              les données du restaurant sont conservées et restaurées intégralement au renouvellement.
            </p>
          </Section>

          <Section title="7. Propriété intellectuelle">
            <p>
              La marque nreservi.online, le logo, la charte graphique et l'ensemble des contenus de la plateforme sont
              protégés par le droit algérien de la propriété intellectuelle. Toute reproduction sans autorisation
              préalable est interdite.
            </p>
          </Section>

          <Section title="8. Droit applicable et litiges">
            <p>
              Les présentes conditions sont régies par le droit algérien. En cas de litige, les parties s'efforceront
              de le résoudre à l'amiable ; à défaut, les tribunaux algériens compétents seront saisis.
            </p>
          </Section>
        </div>

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 mt-10">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
