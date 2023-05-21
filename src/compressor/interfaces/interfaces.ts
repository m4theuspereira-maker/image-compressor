export interface ICompressionStatistics {
  input: string;
  path_out_new: string;
  algorithm: string;
  size_in: number;
  size_output: number;
  percent: number;
  err: any;
}
