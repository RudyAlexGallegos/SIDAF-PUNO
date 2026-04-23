"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, Download, Trophy, Filter, ChevronDown, ChevronRight, MapPin, FileText } from "lucide-react"
import { getDesignaciones, getArbitros, getCampeonatos, getEquipos, deleteDesignacion, type Designacion, type Arbitro, type Campeonato, type Equipo } from "@/services/api"
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCache } from "@/hooks/useCache"
import { TableSkeleton } from "@/components/Skeletons"

// Backup of original file with all functionality preserved
