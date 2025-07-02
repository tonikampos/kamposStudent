'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { getCurrentAcademicYear, setCurrentAcademicYear, getAcademicYears } from '@/lib/dataManager'

interface AcademicYearSelectorProps {
  className?: string
}

export default function AcademicYearSelector({ className = '' }: AcademicYearSelectorProps) {
  const [currentYear, setCurrentYear] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const academicYears = getAcademicYears()

  useEffect(() => {
    setCurrentYear(getCurrentAcademicYear())
  }, [])

  const handleYearChange = (year: string) => {
    setCurrentYear(year)
    setCurrentAcademicYear(year)
    setIsOpen(false)
  }

  const formatAcademicYear = (year: string) => {
    return `Curso ${year}`
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {formatAcademicYear(currentYear)}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Año Académico
              </div>
              {academicYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    year === currentYear ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span>{formatAcademicYear(year)}</span>
                  {year === currentYear && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-100 px-3 py-2">
              <div className="text-xs text-gray-500">
                Los datos se filtran automáticamente por el año seleccionado
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
