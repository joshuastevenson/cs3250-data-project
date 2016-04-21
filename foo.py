runsF = open ("runs.csv")
runs = runsF.readlines()
runsO = open("out.csv", "w")

runsO.write(runs[0])
for r in runs[1:]:
	row = r.split(',')

	if (row[1] != "NULL") and (int(row[1].split("/")[2]) > 2010 ):
		runsO.write(r)

runsO.close()