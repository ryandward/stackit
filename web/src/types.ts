export type AppId =
  | 'files'
  | 'graph'
  | 'lineage'
  | 'sharing'
  | 'view'
  | 'members'

export type InstitutionKind =
  | 'university'
  | 'hospital'
  | 'tribal_nation'
  | 'other'

export type Affiliation = {
  institution: {
    id: number
    name: string
    kind: InstitutionKind
    country: string | null
  }
  role: string
  degree: string | null
  start_year: number | null
  end_year: number | null
}

export type Member = {
  id: number
  email: string
  displayName: string | null
  affiliations: Affiliation[]
}
