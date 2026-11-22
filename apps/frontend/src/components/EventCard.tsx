import React from 'react';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Clock,
  Ticket,
} from 'lucide-react';
import { IEventListItem, IEvent } from 'shared';
import { getImageUrl } from '@/utils/imageUrl';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface EventCardProps {
  event: IEventListItem | IEvent;
  onSelect?: (event: IEventListItem | IEvent) => void;
  detailUrl?: string;
  className?: string;
}

const formatDateRange = (start: Date | string, end?: Date | string) => {
  const startDate = new Date(start);
  const formattedStart = startDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return formattedStart;
};

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num) || num === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  detailUrl,
  className = '',
}) => {
  const isPaid = event.isPaid;
  const priceDisplay = isPaid ? formatCurrency(event.price) : 'Gratis';

  // Quota calculation if registeredCount is present
  const registered = 'registeredCount' in event ? event.registeredCount : 0;
  const max = event.maxParticipants || 0;
  const remaining = Math.max(0, max - registered);
  const isFull = max > 0 && remaining === 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(event);
    } else if (detailUrl) {
      window.location.href = detailUrl;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group card-event bg-white/70 backdrop-blur-md border border-blue-200/50 rounded-3xl overflow-hidden shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col ${className}`}
    >
      {/* Banner / Header Image */}
      <div className="relative w-full h-44 bg-gradient-to-br from-blue-100 to-sky-200 overflow-hidden flex items-center justify-center">
        {event.bannerUrl ? (
          <img
            src={getImageUrl(event.bannerUrl)}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue-400 gap-2">
            <Ticket className="w-12 h-12" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Event Ticketing
            </span>
          </div>
        )}

        {/* Floating Price Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
              isPaid
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {priceDisplay}
          </span>
        </div>

        {/* Quota Badge */}
        {isFull && (
          <div className="absolute top-3 left-3">
            <Badge variant="red">Kuota Penuh</Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Title */}
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h4>

          {/* Description snippet */}
          {event.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Meta Info: Date, Location, Quota */}
        <div className="flex flex-col gap-2 text-xs text-slate-600 pt-3 border-t border-blue-100/60">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{formatDateRange(event.eventStartDate, event.eventEndDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {'registeredCount' in event && max > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Sisa <strong className="text-slate-800">{remaining}</strong> dari{' '}
                {max} kursi
              </span>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
          <span>Lihat Detail</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
