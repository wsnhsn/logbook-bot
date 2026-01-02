export interface Record {
    manifest_id: string
    row_index: number
    Waktu: string
    Tstart: string
    Tend: string
    JenisLogId: number
    IsLuring: number
    Lokasi: string
    Keterangan: string
    FilePath: string
    Dosen: string
}

export interface RecordsResponse {
    success: boolean
    records: Record[]
    count: number
}

export interface UpdateRecordRequest {
    Waktu?: string
    Tstart?: string
    Tend?: string
    JenisLogId?: number
    IsLuring?: number
    Lokasi?: string
    Keterangan?: string
    FilePath?: string
    Dosen?: string
}
